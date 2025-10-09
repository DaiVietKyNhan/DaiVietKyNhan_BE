import CustomZodValidationPipe from '@/common/pipes/custom-zod-validation.pipe'
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { MailModule } from './3rdService/mail/mail.module'
import { TransformInterceptor } from './common/interceptor/transform.interceptor'
import { AttendanceModule } from './modules/attendance/attendance.module'
import { AttendenceConfigModule } from './modules/attendence-config/attendence-config.module'
import { AuthModule } from './modules/auth/auth.module'
import { ChiTietKyNhanModule } from './modules/chitietkynhan/chitietkynhan.module'
import { KyNhanModule } from './modules/kynhan/kynhan.module'
import { MediaModule } from './modules/media/media.module'
import { PermissionModule } from './modules/permission/permission.module'
import { RoleModule } from './modules/role/role.module'
import { SharedModule } from './shared/shared.module'
import { SystemConfigModule } from './modules/system-config/system-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true // Cho phép dùng process.env ở mọi nơi
    }),
    ScheduleModule.forRoot(),

    MailModule,
    SharedModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    KyNhanModule,
    ChiTietKyNhanModule,
    MediaModule,
    AttendenceConfigModule,
    AttendanceModule,
    SystemConfigModule
  ],

  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
