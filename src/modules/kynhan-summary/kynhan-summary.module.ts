import { UploadModule } from '@/3rdService/upload/upload.module'
import { Module } from '@nestjs/common'
import { LandModule } from '../land/land.module'
import { KyNhanSummaryController } from './kynhan-summary.controller'
import { KyNhanSummaryRepo } from './kynhan-summary.repo'
import { KyNhanSummaryService } from './kynhan-summary.service'

@Module({
  imports: [UploadModule, LandModule],
  controllers: [KyNhanSummaryController],
  providers: [KyNhanSummaryService, KyNhanSummaryRepo],
  exports: [KyNhanSummaryService, KyNhanSummaryRepo]
})
export class KynhanSummaryModule {}
