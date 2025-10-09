import { ATTENDANCE_MESSAGE } from '@/common/constants/message'
import { ConflictException } from '@nestjs/common'

export const AttendancegAlreadyExistsException = new ConflictException(
  ATTENDANCE_MESSAGE.CHECKIN_ALREADY
)
