import { Module } from '@nestjs/common'

import { UploadModule } from '@/3rdService/upload/upload.module'
import { KynhanController } from './kynhan.controller'
import { KynhanRepo } from './kynhan.repo'
import { KynhanService } from './kynhan.service'

@Module({
  imports: [UploadModule],
  controllers: [KynhanController],
  providers: [KynhanService, KynhanRepo],
  exports: [KynhanService, KynhanRepo]
})
export class KyNhanModule {}
