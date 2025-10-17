import { Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

import { AchievementController } from './achievement.controller'
import { AchievementRepo } from './achievement.repo'
import { AchievementService } from './achievement.service'
import { UserAchievementController } from './user-achievement.controller'
import { UserAchievementRepo } from './user-achievement.repo'
import { UserAchievementService } from './user-achievement.service'
import { AchievementCheckerService } from './achievement-checker.service'

@Module({
    controllers: [AchievementController, UserAchievementController],
    providers: [
        AchievementService,
        AchievementRepo,
        UserAchievementService,
        UserAchievementRepo,
        AchievementCheckerService,
        PrismaService
    ],
    exports: [AchievementService, UserAchievementService, AchievementCheckerService]
})
export class AchievementModule { }
