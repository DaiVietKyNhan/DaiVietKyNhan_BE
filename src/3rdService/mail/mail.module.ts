import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { RedisModule } from '../redis/redis.module';
import { MailModule as MailerConfigModule } from './mailer/mail.module';

@Module({
  imports: [
    ConfigModule, 
    RedisModule, 
    MailerConfigModule, 
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService], 
})
export class MailModule { }