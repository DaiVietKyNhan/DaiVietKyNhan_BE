import { ConflictException } from '@nestjs/common'

export const UserLandBargeAlreadyExistsException = new ConflictException(
  'Bạn đã có huy hiệu này rồi'
)
