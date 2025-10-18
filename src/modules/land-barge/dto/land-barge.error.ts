import { ConflictException } from '@nestjs/common'

export const LandBargeAlreadyExistsException = new ConflictException(
  'Huy hiệu đã tồn tại'
)
