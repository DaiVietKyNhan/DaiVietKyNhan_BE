import { UploadModule } from '@/3rdService/upload/upload.module'
import { TestQuestionHomeModule } from '@/modules/test-question-home/test-question-home.module'
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { GodProfileController } from './god-profile.controller'
import { GodProfileRepo } from './god-profile.repo'
import { GodProfileService } from './god-profile.service'

@Module({
  imports: [UploadModule, TestQuestionHomeModule, UserModule],
  controllers: [GodProfileController],
  providers: [GodProfileService, GodProfileRepo]
})
export class GodProfileModule {}
