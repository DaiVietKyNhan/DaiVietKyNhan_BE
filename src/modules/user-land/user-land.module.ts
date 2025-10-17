import { Module } from '@nestjs/common'
import { LandModule } from '../land/land.module'
import { UserLandController } from './user-land.controller'
import { UserLandRepo } from './user-land.repo'
import { UserLandService } from './user-land.service'

@Module({
  imports: [LandModule],
  controllers: [UserLandController],
  providers: [UserLandService, UserLandRepo],
  exports: [UserLandService, UserLandRepo]
})
export class UserLandModule {}
