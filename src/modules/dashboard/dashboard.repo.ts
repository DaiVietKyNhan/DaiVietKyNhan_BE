import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DashboardRepo {
  constructor(private prismaService: PrismaService) {}

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
      where: { deletedAt: null, status: 'ACTIVE' }
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
    // Count unique devices that have been active (web visits approximation)
    const result = await this.prismaService.device.count({
      where: {
        isActive: true,
        user: {
          deletedAt: null,
          status: 'ACTIVE'
        }
      }
    })

    return result
  }

  async getWebVisitsLastWeek(): Promise<number> {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const result = await this.prismaService.device.count({
      where: {
        isActive: true,
        lastActive: {
          gte: lastWeek,
          lt: new Date()
        },
        user: {
          deletedAt: null,
          status: 'ACTIVE'
        }
      }
    })

    return result
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
}
