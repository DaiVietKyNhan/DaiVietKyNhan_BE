import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DashboardRepo {
  constructor(private prismaService: PrismaService) {}

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
}
