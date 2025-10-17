import { Module } from '@nestjs/common'
import { LandModule } from '../land/land.module'
import { AchievementModule } from '../achievement/achievement.module'
import { UserLandController } from './user-land.controller'
import { UserLandRepo } from './user-land.repo'
import { UserLandService } from './user-land.service'

@Module({
  imports: [LandModule, AchievementModule],
  controllers: [UserLandController],
  providers: [UserLandService, UserLandRepo]
})
export class UserLandModule { }
