import { Module } from '@nestjs/common'
import { MediaController } from './media.controller'
import { MediaRepository } from './media.repo'
import { MediaService } from './media.service'

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService, MediaRepository]
})
export class MediaModule {}
