import { Module } from '@nestjs/common'
import { AchievementModule } from '../achievement/achievement.module'
import { LandModule } from '../land/land.module'
import { UserLandBargeModule } from '../user-land-barge/user-land-barge.module'
import { UserLandController } from './user-land.controller'
import { UserLandRepo } from './user-land.repo'
import { UserLandService } from './user-land.service'

@Module({
  imports: [LandModule, AchievementModule, UserLandBargeModule],
  controllers: [UserLandController],
  providers: [UserLandService, UserLandRepo],
  exports: [UserLandService, UserLandRepo]
})
export class UserLandModule {}
