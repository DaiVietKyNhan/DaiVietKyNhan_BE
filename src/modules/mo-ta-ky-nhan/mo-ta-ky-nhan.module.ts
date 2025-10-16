import { UploadModule } from '@/3rdService/upload/upload.module'
import { Module } from '@nestjs/common'
import { MotaKyNhanController } from './mo-ta-ky-nhan.controller'
import { MotaKyNhanRepo } from './mo-ta-ky-nhan.repo'
import { MotaKyNhanService } from './mo-ta-ky-nhan.service'

@Module({
  imports: [UploadModule],
  controllers: [MotaKyNhanController],
  providers: [MotaKyNhanService, MotaKyNhanRepo]
})
export class MoTaKyNhanModule {}
