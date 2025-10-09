import { Module } from '@nestjs/common'
import { AttendenceConfigModule } from '../attendence-config/attendence-config.module'
import { AttendanceController } from './attendance.controller'
import { AttendanceService } from './attendance.service'
import { AttendanceRepo } from './attendence.repo'

@Module({
  imports: [AttendenceConfigModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepo]
})
export class AttendanceModule {}
