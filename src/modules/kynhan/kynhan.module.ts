import { Module } from '@nestjs/common'
import { ChiTietKyNhanModule } from '../chitietkynhan/chitietkynhan.module'

import { UploadModule } from '@/3rdService/upload/upload.module'
import { KynhanController } from './kynhan.controller'
import { KynhanRepo } from './kynhan.repo'
import { KynhanService } from './kynhan.service'

@Module({
  imports: [ChiTietKyNhanModule, UploadModule],
  controllers: [KynhanController],
  providers: [KynhanService, KynhanRepo],
  exports: [KynhanService, KynhanRepo]
})
export class KyNhanModule {}
