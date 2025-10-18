import { Module } from '@nestjs/common'
import { LandBargeModule } from '../land-barge/land-barge.module'
import { UserLandBargeController } from './user-land-barge.controller'
import { UserLandBargeRepo } from './user-land-barge.repo'
import { UserLandBargeService } from './user-land-barge.service'

@Module({
  imports: [LandBargeModule],
  controllers: [UserLandBargeController],
  providers: [UserLandBargeService, UserLandBargeRepo]
})
export class UserLandBargeModule {}
