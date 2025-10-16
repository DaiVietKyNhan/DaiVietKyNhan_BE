import { Module } from '@nestjs/common'
import { LandController } from './land.controller'
import { LandRepo } from './land.repo'
import { LandService } from './land.service'

@Module({
  controllers: [LandController],
  providers: [LandService, LandRepo]
})
export class LandModule {}
