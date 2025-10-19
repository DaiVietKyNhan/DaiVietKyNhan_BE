import { UploadModule } from '@/3rdService/upload/upload.module'
import { Module } from '@nestjs/common'
import { LandBargeController } from './land-barge.controller'
import { LandBargeRepo } from './land-barge.repo'
import { LandBargeService } from './land-barge.service'

@Module({
  imports: [UploadModule],
  controllers: [LandBargeController],
  providers: [LandBargeService, LandBargeRepo],
  exports: [LandBargeService, LandBargeRepo]
})
export class LandBargeModule {}
