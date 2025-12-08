import envConfig from '@/config/env.config'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import fs from 'fs'
import { google } from 'googleapis'

@Injectable()
export class DashboardRepo {
  constructor(
    private prismaService: PrismaService,
    private sharedRoleRepo: SharedRoleRepository
  ) {}

  private static webVisitsCache: { value: number; expires: number } | null = null
  private static webVisitsLastWeekCache: { value: number; expires: number } | null = null
  private readonly logger = new Logger(DashboardRepo.name)

  /**
   * Create Google auth client using env credentials or key file.
   */
  private async createGoogleAuthClient() {
    const saClientEmail = envConfig.GA_SA_CLIENT_EMAIL
    const saPrivateKey = envConfig.GA_SA_PRIVATE_KEY

    let auth: any
    if (saClientEmail && saPrivateKey) {
      const normalizedKey = saPrivateKey.includes('\\n')
        ? saPrivateKey.replace(/\\n/g, '\n')
        : saPrivateKey

      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: saClientEmail,
          private_key: normalizedKey
        },
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
      })
    } else {
      const credPath = envConfig.GOOGLE_APPLICATION_CREDENTIALS
      if (!credPath || !fs.existsSync(credPath)) {
        throw new Error('Google credentials not available')
      }

      auth = new google.auth.GoogleAuth({
        keyFile: credPath,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
      })
    }

    const client = await auth.getClient()
    // attach to google global options to reuse
    google.options({ auth: client as any })
    return { auth, client }
  }

  /** Extract a metric value from Analytics Data API response by metric name. */
  private extractMetricValueFromRes(resData: any, metricIndex = 0): number {
    if (!resData) return 0

    // Prefer totals
    if (resData.totals && resData.totals.length > 0 && resData.totals[0].metricValues) {
      return Number(resData.totals[0].metricValues[metricIndex]?.value || 0)
    }

    // Fallback: sum across rows by metricIndex
    if (resData.rows && resData.rows.length > 0) {
      return resData.rows.reduce(
        (s: number, r: any) => s + Number(r.metricValues?.[metricIndex]?.value || 0),
        0
      )
    }

    return 0
  }

  async getUserPlayStats() {
    // Current month range
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

    // Previous month range
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const startOfPrevMonth = new Date(prevYear, prevMonth, 1)
    const endOfPrevMonth = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999)

    // Total users (active, not deleted)
    const totalUser = await this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        role: {
          name: { not: 'ADMIN' }
        }
      }
    })

    // Total plays (sum of amountAttempt for logs in current month)
    const logsThisMonth = await this.prismaService.userAnswerLog.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      },
      select: { amountAttempt: true }
    })
    const totalPlays = logsThisMonth.reduce((sum, l) => sum + l.amountAttempt, 0)

    // Previous month: users created in prev month
    const totalUserPrev = await this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth }
      }
    })

    // Previous month: total plays
    const logsPrevMonth = await this.prismaService.userAnswerLog.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth }
      },
      select: { amountAttempt: true }
    })
    const totalPlaysPrev = logsPrevMonth.reduce((sum, l) => sum + l.amountAttempt, 0)

    // Percent change formulas
    const ratemonthPre =
      totalUserPrev > 0
        ? Math.round(((totalUser - totalUserPrev) / totalUserPrev) * 100 * 100) / 100
        : 0
    const ratePlayPre =
      totalPlaysPrev > 0
        ? Math.round(((totalPlays - totalPlaysPrev) / totalPlaysPrev) * 100 * 100) / 100
        : 0

    return { totalUser, totalPlays, ratemonthPre, ratePlayPre }
  }

  async getTotalUsers(): Promise<number> {
    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE'
      }
    })
  }

  /** Count active users excluding admin role */
  async getTotalUsersExcludingAdmin(): Promise<number> {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        roleId: { not: adminRoleId }
      }
    })
  }

  /** Count users by whether they have a godProfile (null vs not null), excluding admins */
  async getUsersCountByGodProfile(hasGodProfile: boolean): Promise<number> {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        roleId: { not: adminRoleId },
        godProfileId: hasGodProfile ? { not: null } : null
      }
    })
  }

  /** Count users (excluding admins) as of a given date (createdAt <= asOf) optionally filtering by godProfile presence */
  async getUsersCountByGodProfileAsOfDate(
    hasGodProfile: boolean,
    asOf: Date
  ): Promise<number> {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        roleId: { not: adminRoleId },
        godProfileId: hasGodProfile ? { not: null } : null,
        createdAt: { lte: asOf }
      }
    })
  }

  /** Total users (excluding admins) as of a given date (createdAt <= asOf) */
  async getTotalUsersExcludingAdminAsOfDate(asOf: Date): Promise<number> {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        roleId: { not: adminRoleId },
        createdAt: { lte: asOf }
      }
    })
  }

  async getTotalUsersLastMonth(): Promise<number> {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        createdAt: {
          lt: lastMonth
        }
      }
    })
  }

  async getWebVisits(): Promise<number> {
    console.log('dang call ga')

    // Return cached value if still valid
    const now = Date.now()
    if (DashboardRepo.webVisitsCache && DashboardRepo.webVisitsCache.expires > now) {
      return DashboardRepo.webVisitsCache.value
    }

    // Try to fetch from Google Analytics Data API (GA4) using service account
    try {
      const propertyId = envConfig.GA_PROPERTY_ID

      // Prefer credentials passed directly via env vars (avoid JSON file)
      // GA_SA_CLIENT_EMAIL and GA_SA_PRIVATE_KEY can be set in .env
      const saClientEmail = envConfig.GA_SA_CLIENT_EMAIL
      const saPrivateKey = envConfig.GA_SA_PRIVATE_KEY

      let auth: any
      if (saClientEmail && saPrivateKey) {
        // Private key in .env may contain literal \n; replace escaped newlines if present
        const normalizedKey = saPrivateKey.includes('\\n')
          ? saPrivateKey.replace(/\\n/g, '\n')
          : saPrivateKey

        auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: saClientEmail,
            private_key: normalizedKey
          },
          scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        })
      } else {
        // Fallback: credentials file path from env config (must be set)
        const credPath = envConfig.GOOGLE_APPLICATION_CREDENTIALS
        if (!credPath || !fs.existsSync(credPath)) {
          this.logger.warn(
            'Google credentials not found (env creds or file); falling back to device count'
          )
          throw new Error('Google credentials not available')
        }

        auth = new google.auth.GoogleAuth({
          keyFile: credPath,
          scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        })
      }

      const analyticsData = google.analyticsdata('v1beta')
      const client = await auth.getClient()
      // Attach auth client globally for the googleapis instance to avoid typing overloads
      // google.options typing can be strict; cast client to any to satisfy union types at compile-time
      google.options({ auth: client as any })

      // compute dates: fixed start 2025-10-15 to today
      const today = new Date()
      const fmt = (d: Date) => d.toISOString().slice(0, 10)
      const startDate = '2025-10-15'
      const endDate = fmt(today)

      const res = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          metrics: [{ name: 'screenPageViews' }],
          dateRanges: [{ startDate, endDate }]
        }
      })
      console.log('xong call ga')
      console.log('data ne: ', res.data)

      // Try to read totals -> metricValues
      let visits = 0
      // @ts-ignore - runtime shape may vary
      if (res.data && (res.data.totals || res.data.rows)) {
        // totals preferred
        // @ts-ignore
        if (
          res.data.totals &&
          res.data.totals.length > 0 &&
          res.data.totals[0].metricValues
        ) {
          // @ts-ignore
          visits = Number(res.data.totals[0].metricValues[0].value || 0)
        } else if (res.data.rows && res.data.rows.length > 0) {
          // sum first metric across rows
          // @ts-ignore
          visits = res.data.rows.reduce(
            (s: number, r: any) => s + Number(r.metricValues?.[0]?.value || 0),
            0
          )
        }
      }

      // Cache for 10 minutes
      DashboardRepo.webVisitsCache = { value: visits, expires: now + 10 * 60 * 1000 }
      return visits
    } catch (err) {
      this.logger.warn('Failed to fetch GA data: ' + (err as Error).message)

      // Fallback: Count unique devices that have been active (existing approximation)
      const result = await this.prismaService.device.count({
        where: {
          isActive: true,
          user: {
            deletedAt: null,
            status: 'ACTIVE'
          }
        }
      })

      // Cache fallback for 1 minute to avoid DB pressure
      DashboardRepo.webVisitsCache = { value: result, expires: now + 60 * 1000 }
      return result
    }
  }

  async getWebVisitsLastWeek(): Promise<number> {
    // Return cached value if still valid
    const now = Date.now()
    if (
      DashboardRepo.webVisitsLastWeekCache &&
      DashboardRepo.webVisitsLastWeekCache.expires > now
    ) {
      return DashboardRepo.webVisitsLastWeekCache.value
    }

    // We'll attempt to fetch screenPageViews for the previous 7-day window (14 -> 8 days ago)
    try {
      const propertyId = envConfig.GA_PROPERTY_ID
      if (!propertyId) throw new Error('GA_PROPERTY_ID not configured')

      const { client } = await this.createGoogleAuthClient()
      const analyticsData = google.analyticsdata('v1beta')

      // compute dates: start = 1 month ago, end = today
      const today = new Date()
      const start = new Date(today)
      start.setMonth(today.getMonth() - 1)

      const fmt = (d: Date) => d.toISOString().slice(0, 10)

      const res = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          metrics: [{ name: 'screenPageViews' }],
          dateRanges: [{ startDate: fmt(start), endDate: fmt(today) }]
        }
      })

      const visits = this.extractMetricValueFromRes(res.data, 0)

      // cache for 10 minutes
      DashboardRepo.webVisitsLastWeekCache = {
        value: visits,
        expires: now + 10 * 60 * 1000
      }
      return visits
    } catch (err) {
      this.logger.warn('Failed to fetch GA data for last week: ' + (err as Error).message)

      // Fallback: count devices active in that month-ago range
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      const end = new Date()

      const result = await this.prismaService.device.count({
        where: {
          isActive: true,
          lastActive: {
            gte: start,
            lt: end
          },
          user: {
            deletedAt: null,
            status: 'ACTIVE'
          }
        }
      })

      // cache fallback for 1 minute
      DashboardRepo.webVisitsLastWeekCache = { value: result, expires: now + 60 * 1000 }
      return result
    }
  }

  async getTotalQuestions(): Promise<number> {
    return this.prismaService.question.count({
      where: {
        deletedAt: null
      }
    })
  }

  async getNewQuestionsThisWeek(): Promise<number> {
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)

    return this.prismaService.question.count({
      where: {
        deletedAt: null,
        createdAt: {
          gte: thisWeek
        }
      }
    })
  }

  async getInteractionRate(): Promise<number> {
    // Calculate participation rate: users who have answered questions / total active users
    const [totalActiveUsers, usersWithAnswers] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE'
        }
      }),
      this.prismaService.user.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          userAnswerLogs: {
            some: {
              deletedAt: null
            }
          }
        }
      })
    ])

    if (totalActiveUsers === 0) return 0

    return Math.round((usersWithAnswers / totalActiveUsers) * 100 * 10) / 10 // Round to 1 decimal place
  }

  async getQuestionStats() {
    //lau count va cau tra loi cua user

    const [countQuestion, userAnswerLogs] = await Promise.all([
      this.prismaService.question.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.userAnswerLog.findMany({
        where: {
          deletedAt: null
        },
        select: {
          amountAttempt: true,
          isCorrect: true
        }
      })
    ])

    // Calculate total attempts and correct attempts
    let totalAttempts = 0
    let totalCorrect = 0

    for (const log of userAnswerLogs) {
      totalAttempts += log.amountAttempt
      if (log.isCorrect) {
        totalCorrect += 1
      }
    }

    // Calculate correct rate
    const rateCorrect =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100 * 100) / 100 : 0

    return {
      countQuestion,
      rateCorrect
    }
  }

  async getPointsStats() {
    // Aggregate average and max points for active (non-deleted) users
    const agg = await this.prismaService.user.aggregate({
      where: {
        deletedAt: null
      },
      _avg: { point: true },
      _max: { point: true }
    })

    const averagePoint = Math.round(((agg._avg.point ?? 0) + Number.EPSILON) * 100) / 100
    const maxPoint = agg._max.point ?? 0

    // Threshold = averagePoint + 35%
    const threshold = averagePoint * 1.35

    const totalUserLargePoint = await this.prismaService.user.count({
      where: {
        deletedAt: null,
        point: { gt: Math.floor(threshold) }
      }
    })

    return { averagePoint, maxPoint, totalUserLargePoint }
  }

  async getUserStatsByMonth() {
    const currentYear = new Date().getFullYear()
    const monthNames = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12'
    ]

    const monthlyStats: any[] = []

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(currentYear, month - 1, 1)
      const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999)
      const prevMonthStart = new Date(currentYear, month - 2, 1)
      const prevMonthEnd = new Date(currentYear, month - 1, 0, 23, 59, 59, 999)

      // Get new users in this month
      const newUsers = await this.prismaService.user.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })

      // Get previous month users for percentage change
      const prevMonthUsers = await this.prismaService.user.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: prevMonthStart,
            lte: prevMonthEnd
          }
        }
      })

      const changePercent =
        prevMonthUsers > 0
          ? Math.round(((newUsers - prevMonthUsers) / prevMonthUsers) * 100 * 100) / 100
          : 0

      // Get total plays in this month: sum of attempts across logs created in month
      const logsThisMonth = await this.prismaService.userAnswerLog.findMany({
        where: {
          deletedAt: null,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          amountAttempt: true,
          isCorrect: true
        }
      })

      const totalPlays = logsThisMonth.reduce((sum, l) => sum + l.amountAttempt, 0)

      // passRate (%): total correct over total attempts of the month
      // Note: schema tracks final correctness per log; we approximate correct attempts as count of correct logs
      const correctAnswers = logsThisMonth.filter((l) => l.isCorrect).length

      const passRate =
        totalPlays > 0 ? Math.round((correctAnswers / totalPlays) * 100 * 100) / 100 : 0

      monthlyStats.push({
        month,
        monthName: monthNames[month - 1],
        newUsers,
        changePercent,
        totalPlays,
        passRate
      })
    }

    return monthlyStats
  }

  async getTopPlayers(limit = 10) {
    // Get users with their answer statistics
    const users = await this.prismaService.user.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        userAnswerLogs: {
          some: {
            deletedAt: null
          }
        }
      },
      select: {
        id: true,
        name: true,
        point: true,
        userAnswerLogs: {
          where: {
            deletedAt: null
          },
          select: {
            isCorrect: true,
            amountAttempt: true
          }
        }
      }
    })

    // Calculate stats for each user
    const playerStats = users.map((user) => {
      // Total attempts = sum of all amountAttempt from all answer logs
      const totalAnswers = user.userAnswerLogs.reduce(
        (sum, log) => sum + log.amountAttempt,
        0
      )

      // Correct answers = count of logs where isCorrect = true (each counts as 1 correct answer)
      const correctAnswers = user.userAnswerLogs.filter((log) => log.isCorrect).length

      // correctRate should be a ratio (0–1): correct answers / total attempts
      // Round to 2 decimals for stability in UI
      const correctRate =
        totalAnswers > 0
          ? Math.round((correctAnswers / totalAnswers) * 100 * 100) / 100
          : 0

      return {
        userId: user.id,
        name: user.name,
        totalAnswers,
        correctRate,
        currentPoints: user.point
      }
    })

    // Sort by points desc, then by correctRate desc
    playerStats.sort((a, b) => {
      if (b.currentPoints !== a.currentPoints) {
        return b.currentPoints - a.currentPoints
      }
      return b.correctRate - a.correctRate
    })

    return playerStats.slice(0, limit)
  }

  async getLandStatistics() {
    const lands = await this.prismaService.land.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        questions: {
          where: {
            deletedAt: null
          },
          select: {
            userAnswerLogs: {
              where: {
                deletedAt: null
              }
            }
          }
        },
        userLands: {
          where: {
            deletedAt: null,
            status: {
              in: ['PENDING', 'COMPLETED']
            }
          },
          select: {
            status: true,
            user: {
              select: {
                point: true
              }
            }
          }
        }
      }
    })

    const landStats = lands.map((land) => {
      // Calculate total answers for this land: sum of amountAttempt for all userAnswerLogs of questions in the land
      let totalAnswers = 0
      land.questions.forEach((question) => {
        if (question.userAnswerLogs && question.userAnswerLogs.length > 0) {
          totalAnswers += question.userAnswerLogs.reduce(
            (sum, log) => sum + (log.amountAttempt ?? 0),
            0
          )
        }
      })

      // Calculate average points from users in this land (PENDING or COMPLETED)
      const userPoints = land.userLands.map((ul) => ul.user.point)
      const averagePoints =
        userPoints.length > 0
          ? Math.round(
              (userPoints.reduce((sum, p) => sum + p, 0) / userPoints.length) * 100
            ) / 100
          : 0

      // Calculate completion rate
      const completedCount = land.userLands.filter(
        (ul) => ul.status === 'COMPLETED'
      ).length
      const totalUserLands = land.userLands.length
      const completionRate =
        totalUserLands > 0
          ? Math.round((completedCount / totalUserLands) * 100 * 100) / 100
          : 0

      return {
        landId: land.id,
        landName: land.name,
        totalAnswers,
        averagePoints,
        completionRate
      }
    })

    return landStats
  }

  /**
   * Get gender and age statistics for all users
   */
  async getGenderAgesStats() {
    // Get all non-deleted users with gender and birthDate
    const users = await this.prismaService.user.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        role: { name: { not: 'ADMIN' } }
      },
      select: {
        id: true,
        gender: true,
        birthDate: true
      }
    })

    const totalUsers = users.length
    const currentYear = new Date().getFullYear()

    // Count by gender
    const maleCount = users.filter((u) => u.gender === 'MALE').length
    const femaleCount = users.filter((u) => u.gender === 'FEMALE').length

    // Calculate age and count by age range
    const ageRanges = {
      '0-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35-50': 0,
      '50+': 0
    }

    users.forEach((user) => {
      if (user.birthDate) {
        const birthYear = new Date(user.birthDate).getFullYear()
        const age = currentYear - birthYear

        if (age <= 17) {
          ageRanges['0-17']++
        } else if (age <= 24) {
          ageRanges['18-24']++
        } else if (age <= 34) {
          ageRanges['25-34']++
        } else if (age <= 50) {
          ageRanges['35-50']++
        } else {
          ageRanges['50+']++
        }
      }
    })

    // Calculate percentages (round to 2 decimal places)
    const calcPercent = (count: number) =>
      totalUsers > 0 ? Math.round((count / totalUsers) * 10000) / 100 : 0

    return {
      genders: {
        male: {
          amount: maleCount,
          percent: calcPercent(maleCount)
        },
        female: {
          amount: femaleCount,
          percent: calcPercent(femaleCount)
        },
        other: {
          amount: totalUsers - maleCount - femaleCount,
          percent: calcPercent(totalUsers - maleCount - femaleCount)
        }
      },
      ages: {
        '0-17': {
          amount: ageRanges['0-17'],
          percent: calcPercent(ageRanges['0-17'])
        },
        '18-24': {
          amount: ageRanges['18-24'],
          percent: calcPercent(ageRanges['18-24'])
        },
        '25-34': {
          amount: ageRanges['25-34'],
          percent: calcPercent(ageRanges['25-34'])
        },
        '35-50': {
          amount: ageRanges['35-50'],
          percent: calcPercent(ageRanges['35-50'])
        },
        '50+': {
          amount: ageRanges['50+'],
          percent: calcPercent(ageRanges['50+'])
        }
      }
    }
  }

  /**
   * Get active users count for a given date range (users who have answer logs in the period)
   */
  async getActiveUsersInPeriod(startDate: Date, endDate: Date): Promise<number> {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()

    const count = await this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        roleId: { not: adminRoleId },
        userAnswerLogs: {
          some: {
            deletedAt: null,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    })

    return count
  }

  /**
   * Get average session duration across all users with answer logs
   * Approximated by calculating time spans between consecutive answers
   */
  async getAverageSessionDuration(): Promise<number> {
    const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()

    // Get users with their answer logs sorted by time
    const users = await this.prismaService.user.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        roleId: { not: adminRoleId },
        userAnswerLogs: {
          some: {
            deletedAt: null
          }
        }
      },
      select: {
        id: true,
        userAnswerLogs: {
          where: {
            deletedAt: null
          },
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    let totalSessionMinutes = 0
    let sessionCount = 0

    users.forEach((user) => {
      const logs = user.userAnswerLogs
      if (logs.length < 2) return

      // Calculate session duration for this user
      const firstLog = logs[0].createdAt
      const lastLog = logs[logs.length - 1].createdAt
      const durationMs = lastLog.getTime() - firstLog.getTime()
      const durationMinutes = durationMs / (1000 * 60)

      if (durationMinutes > 0) {
        totalSessionMinutes += durationMinutes
        sessionCount++
      }
    })

    // Return average in minutes (rounded to 2 decimal places)
    return sessionCount > 0
      ? Math.round((totalSessionMinutes / sessionCount) * 100) / 100
      : 0
  }

  /**
   * Get user behavior stats from Google Analytics
   * Includes: engagement time, session duration, DAU/WAU/MAU, new vs returning users
   */
  async getUserBehaviorStatsFromGA() {
    try {
      const propertyId = envConfig.GA_PROPERTY_ID
      if (!propertyId) throw new Error('GA_PROPERTY_ID not configured')

      await this.createGoogleAuthClient()
      const analyticsData = google.analyticsdata('v1beta')

      const today = new Date()
      const fmt = (d: Date) => d.toISOString().slice(0, 10)

      // Date ranges
      const startDate = '2025-10-15' // Fixed start date
      const endDate = fmt(today)

      // For DAU (yesterday)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = fmt(yesterday)

      // For WAU (last 7 days)
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const sevenDaysAgoStr = fmt(sevenDaysAgo)

      // For MAU (last 30 days)
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = fmt(thirtyDaysAgo)

      // Fetch multiple metrics in parallel
      const [
        engagementTimeRes,
        sessionDurationRes,
        dauRes,
        wauRes,
        mauRes,
        newVsReturningRes
      ] = await Promise.all([
        // 1. Average engagement time per active user
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            metrics: [{ name: 'userEngagementDuration' }, { name: 'activeUsers' }],
            dateRanges: [{ startDate, endDate }]
          }
        }),

        // 2. Average session duration
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            metrics: [{ name: 'averageSessionDuration' }],
            dateRanges: [{ startDate, endDate }]
          }
        }),

        // 3. DAU - Daily Active Users (yesterday)
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [{ startDate: yesterdayStr, endDate: yesterdayStr }]
          }
        }),

        // 4. WAU - Weekly Active Users (last 7 days)
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [{ startDate: sevenDaysAgoStr, endDate: endDate }]
          }
        }),

        // 5. MAU - Monthly Active Users (last 30 days)
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [{ startDate: thirtyDaysAgoStr, endDate: endDate }]
          }
        }),

        // 6. New vs Returning users (last 30 days)
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dimensions: [{ name: 'newVsReturning' }],
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [{ startDate: thirtyDaysAgoStr, endDate: endDate }]
          }
        })
      ])

      // Extract values
      const totalEngagementDuration = this.extractMetricValueFromRes(
        engagementTimeRes.data,
        0
      )
      const activeUsersCount = this.extractMetricValueFromRes(engagementTimeRes.data, 1)
      const avgEngagementPerUser =
        activeUsersCount > 0
          ? Math.round((totalEngagementDuration / activeUsersCount) * 100) / 100
          : 0

      const avgSessionDuration = this.extractMetricValueFromRes(
        sessionDurationRes.data,
        0
      )

      const dau = this.extractMetricValueFromRes(dauRes.data, 0)
      const wau = this.extractMetricValueFromRes(wauRes.data, 0)
      const mau = this.extractMetricValueFromRes(mauRes.data, 0)

      // Calculate ratios
      const dauMauRatio = mau > 0 ? Math.round((dau / mau) * 1000) / 10 : 0
      const dauWauRatio = wau > 0 ? Math.round((dau / wau) * 1000) / 10 : 0
      const wauMauRatio = mau > 0 ? Math.round((wau / mau) * 1000) / 10 : 0

      // Parse new vs returning users
      let newUsers = 0
      let returningUsers = 0

      if (newVsReturningRes.data.rows && newVsReturningRes.data.rows.length > 0) {
        // @ts-ignore
        newVsReturningRes.data.rows.forEach((row: any) => {
          const userType = row.dimensionValues?.[0]?.value || ''
          const count = Number(row.metricValues?.[0]?.value || 0)

          if (userType === 'new') {
            newUsers = count
          } else if (userType === 'returning') {
            returningUsers = count
          }
        })
      }

      return {
        avgEngagementPerUser, // seconds
        avgSessionDuration, // seconds
        dau,
        wau,
        mau,
        dauMauRatio,
        dauWauRatio,
        wauMauRatio,
        newUsers,
        returningUsers
      }
    } catch (err) {
      this.logger.warn('Failed to fetch GA user behavior data: ' + (err as Error).message)

      // Fallback to database calculations
      const now = new Date()

      // DAU, WAU, MAU from DB
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [dau, wau, mau] = await Promise.all([
        this.getActiveUsersInPeriod(oneDayAgo, now),
        this.getActiveUsersInPeriod(oneWeekAgo, now),
        this.getActiveUsersInPeriod(oneMonthAgo, now)
      ])

      const dauMauRatio = mau > 0 ? Math.round((dau / mau) * 1000) / 10 : 0
      const dauWauRatio = wau > 0 ? Math.round((dau / wau) * 1000) / 10 : 0
      const wauMauRatio = mau > 0 ? Math.round((wau / mau) * 1000) / 10 : 0

      const avgSessionDuration = await this.getAverageSessionDuration()

      const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
      const year = now.getFullYear()
      const month = now.getMonth()
      const startOfMonth = new Date(year, month, 1)
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

      const [newUsers, returningUsers] = await Promise.all([
        this.prismaService.user.count({
          where: {
            deletedAt: null,
            status: 'ACTIVE',
            roleId: { not: adminRoleId },
            createdAt: { gte: startOfMonth, lte: endOfMonth }
          }
        }),
        this.prismaService.user.count({
          where: {
            deletedAt: null,
            status: 'ACTIVE',
            roleId: { not: adminRoleId },
            createdAt: { lt: startOfMonth },
            userAnswerLogs: {
              some: {
                deletedAt: null,
                createdAt: { gte: startOfMonth, lte: endOfMonth }
              }
            }
          }
        })
      ])

      return {
        avgEngagementPerUser: avgSessionDuration * 60, // convert minutes to seconds
        avgSessionDuration: avgSessionDuration * 60,
        dau,
        wau,
        mau,
        dauMauRatio,
        dauWauRatio,
        wauMauRatio,
        newUsers,
        returningUsers
      }
    }
  }
}
