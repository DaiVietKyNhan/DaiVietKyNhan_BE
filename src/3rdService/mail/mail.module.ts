import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { RedisModule } from '../redis/redis.module';
import { MailModule as MailerConfigModule } from './mailer/mail.module';

@Module({
  imports: [
    ConfigModule, // Để sử dụng ConfigService nếu cần
    RedisModule, // Để sử dụng Redis cho OTP
    MailerConfigModule, // Sử dụng MailerModule đã được cấu hình
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService], // Export MailService để các module khác có thể sử dụng
})
export class MailModule { }