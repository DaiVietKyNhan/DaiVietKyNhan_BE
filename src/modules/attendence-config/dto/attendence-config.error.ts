import { ENTITY_MESSAGE } from '@/common/constants/message'
import { ConflictException } from '@nestjs/common'

export const AttendenceConfigAlreadyExistsException = new ConflictException(
  ENTITY_MESSAGE.ALREADY_EXISTS
)
