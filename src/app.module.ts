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

import { FigureModule } from './modules/figure/figure.module'
import { GodProfileModule } from './modules/god-profile/god-profile.module'
import { KyNhanModule } from './modules/kynhan/kynhan.module'
import { MediaModule } from './modules/media/media.module'
import { MoTaKyNhanModule } from './modules/mo-ta-ky-nhan/mo-ta-ky-nhan.module'
import { PermissionModule } from './modules/permission/permission.module'
import { RoleModule } from './modules/role/role.module'
import { SystemConfigModule } from './modules/system-config/system-config.module'
import { TestQuestionHomeModule } from './modules/test-question-home/test-question-home.module'
import { UserTestQuestionHomeModule } from './modules/user-test-question-home/user-test-question-home.module'
import { UserModule } from './modules/user/user.module'
import { SharedModule } from './shared/shared.module'
import { WebsocketsModule } from './websockets/websockets.module'

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

    MediaModule,
    AttendenceConfigModule,
    AttendanceModule,
    SystemConfigModule,
    UserModule,
    WebsocketsModule,
    TestQuestionHomeModule,
    UserTestQuestionHomeModule,
    GodProfileModule,
    FigureModule,
    MoTaKyNhanModule
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
