import { MailModule } from '@/3rdService/mail/mail.module'
import { AchievementModule } from '@/modules/achievement/achievement.module'
import { AuthRepository } from '@/modules/auth/auth.repo'
import { Module } from '@nestjs/common'
import { WebsocketsModule } from '../../websockets/websockets.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleService } from './google.service'

@Module({
  imports: [MailModule, WebsocketsModule, AchievementModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, GoogleService]
})
export class AuthModule { }
