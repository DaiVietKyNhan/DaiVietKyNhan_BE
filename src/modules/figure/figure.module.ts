import { UploadModule } from '@/3rdService/upload/upload.module'
import { Module } from '@nestjs/common'
import { FigureController } from './figure.controller'
import { FigureRepo } from './figure.repo'
import { FigureService } from './figure.service'

@Module({
  imports: [UploadModule],
  controllers: [FigureController],
  providers: [FigureService, FigureRepo]
})
export class FigureModule {}
