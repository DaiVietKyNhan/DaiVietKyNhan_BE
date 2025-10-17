import { UploadModule } from '@/3rdService/upload/upload.module'
import { Module } from '@nestjs/common'
import { KyNhanSummaryController } from './kynhan-summary.controller'
import { KyNhanSummaryRepo } from './kynhan-summary.repo'
import { KyNhanSummaryService } from './kynhan-summary.service'

@Module({
  imports: [UploadModule],
  controllers: [KyNhanSummaryController],
  providers: [KyNhanSummaryService, KyNhanSummaryRepo],
  exports: [KyNhanSummaryService, KyNhanSummaryRepo]
})
export class KynhanSummaryModule {}
