import { Module } from '@nestjs/common'
import { ChangePointUserLogController } from './change-point-user-log.controller'
import { ChangePointUserLogRepo } from './change-point-user-log.repo'
import { ChangePointUserLogService } from './change-point-user-log.service'

@Module({
  controllers: [ChangePointUserLogController],
  providers: [ChangePointUserLogService, ChangePointUserLogRepo],
  exports: [ChangePointUserLogService, ChangePointUserLogRepo]
})
export class ChangePointUserLogModule {}
