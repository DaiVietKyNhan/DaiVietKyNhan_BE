import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { AchievementRepo } from './achievement.repo'
import { UserAchievementRepo } from './user-achievement.repo'

@Injectable()
export class AchievementCheckerService {
  constructor(
    private prismaService: PrismaService,
    private userAchievementRepo: UserAchievementRepo,
    private achievementRepo: AchievementRepo
  ) {}

  /**
   * Kiểm tra và cập nhật thành tựu dựa trên số lượng KyNhanSummary của user
   */
  async checkKyNhanSummaryAchievements(userId: number) {
    try {
      // Lấy số lượng KyNhanSummary của user
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              userKyNhanSummaries: true
            }
          }
        }
      })

      const count = user?._count.userKyNhanSummaries || 0

      // Lấy tất cả thành tựu loại KY_NHAN_SUMMARY_COUNT
      const achievements = await this.achievementRepo.findByType('KY_NHAN_SUMMARY_COUNT')

      for (const achievement of achievements) {
        // Kiểm tra xem user đã đạt được thành tựu này chưa
        const userAchievement = await this.userAchievementRepo.findByUserAndAchievement({
          userId,
          achievementId: achievement.id
        })

        if (!userAchievement) {
          // Tạo user achievement mới
          await this.userAchievementRepo.create({
            createdById: userId,
            data: {
              userId,
              achievementId: achievement.id,
              status: count >= achievement.requirement ? 'COMPLETED' : 'PENDING',
              completedAt: count >= achievement.requirement ? new Date() : null,
              rewardClaimed: false
            }
          })
        } else if (
          userAchievement.status === 'PENDING' &&
          count >= achievement.requirement
        ) {
          // Cập nhật thành tựu đã hoàn thành
          await this.userAchievementRepo.update({
            id: userAchievement.id,
            data: {
              status: 'COMPLETED',
              completedAt: new Date()
            },
            updatedById: userId
          })
        }
      }

      // Achievement check completed
    } catch (error) {
      // Error checking achievements
    }
  }

  /**
   * Kiểm tra và cập nhật thành tựu dựa trên Land của user
   */
  async checkLandAchievements(userId: number) {
    try {
      // Lấy tất cả thành tựu loại LAND_COLLECTION
      const achievements = await this.achievementRepo.findByType('LAND_COLLECTION')

      for (const achievement of achievements) {
        if (!achievement.landId) continue

        // Kiểm tra xem user đã có Land này chưa
        const userLand = await this.prismaService.userLand.findFirst({
          where: {
            userId,
            landId: achievement.landId,
            status: 'COMPLETED'
          }
        })

        const hasLand = !!userLand

        // Kiểm tra xem user đã có thành tựu này chưa
        const userAchievement = await this.userAchievementRepo.findByUserAndAchievement({
          userId,
          achievementId: achievement.id
        })

        if (!userAchievement) {
          // Tạo user achievement mới
          await this.userAchievementRepo.create({
            createdById: userId,
            data: {
              userId,
              achievementId: achievement.id,
              status: hasLand ? 'COMPLETED' : 'PENDING',
              completedAt: hasLand ? new Date() : null,
              rewardClaimed: false
            }
          })
          console.log('check all land: !userAchievement')

          await this.checkAllLandsCollectedAchievements(userId)
        } else if (userAchievement.status === 'PENDING' && hasLand) {
          // Cập nhật thành tựu đã hoàn thành
          await this.userAchievementRepo.update({
            id: userAchievement.id,
            data: {
              status: 'COMPLETED',
              completedAt: new Date()
            },
            updatedById: userId
          })
          console.log('check all land: userAchievement.status === && hasLand')
          await this.checkAllLandsCollectedAchievements(userId)
        }
        await this.checkAllLandsCollectedAchievements(userId)
      }

      // Land achievement check completed
    } catch (error) {
      // Error checking Land achievements
    }
  }

  /**
   * Kiểm tra và cập nhật thành tựu thu thập tất cả vùng đất
   */
  async checkAllLandsCollectedAchievements(userId: number) {
    try {
      // Lấy tất cả thành tựu loại ALL_LANDS_COLLECTED
      const achievements = await this.achievementRepo.findByType('ALL_LANDS_COLLECTED')

      for (const achievement of achievements) {
        // Đếm số lượng vùng đất user đã hoàn thành
        const completedLandsCount = await this.prismaService.userLand.count({
          where: {
            userId,
            status: 'COMPLETED'
          }
        })

        const hasAllLands = completedLandsCount >= achievement.requirement

        // Kiểm tra xem user đã có thành tựu này chưa
        const userAchievement = await this.userAchievementRepo.findByUserAndAchievement({
          userId,
          achievementId: achievement.id
        })

        if (!userAchievement) {
          // Tạo user achievement mới
          await this.userAchievementRepo.create({
            createdById: userId,
            data: {
              userId,
              achievementId: achievement.id,
              status: hasAllLands ? 'COMPLETED' : 'PENDING',
              completedAt: hasAllLands ? new Date() : null,
              rewardClaimed: false
            }
          })
        } else if (userAchievement.status === 'PENDING' && hasAllLands) {
          // Cập nhật thành tựu đã hoàn thành
          await this.userAchievementRepo.update({
            id: userAchievement.id,
            data: {
              status: 'COMPLETED',
              completedAt: new Date()
            },
            updatedById: userId
          })
        }
      }

      // All lands collected achievement check completed
    } catch (error) {
      // Error checking all lands collected achievements
    }
  }

  /**
   * Kiểm tra tất cả thành tựu của user
   */
  async checkAllAchievements(userId: number) {
    await Promise.all([
      this.checkKyNhanSummaryAchievements(userId),
      this.checkLandAchievements(userId),
      this.checkAllLandsCollectedAchievements(userId)
    ])
  }
}
