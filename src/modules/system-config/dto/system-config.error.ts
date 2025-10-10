import { ENTITY_MESSAGE, SYSTEM_CONFIG_MESSAGE } from '@/common/constants/message'
import { ConflictException } from '@nestjs/common'

export const SystemConfiggAlreadyExistsException = new ConflictException(
  ENTITY_MESSAGE.ALREADY_EXISTS
)
export const SystemConfiggHasActiveExistsException = new ConflictException(
  SYSTEM_CONFIG_MESSAGE.HAS_ACTIVE
)
