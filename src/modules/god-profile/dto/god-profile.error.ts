import { ConflictException } from '@nestjs/common'

export const GodProfileAlreadyExistsException = new ConflictException(
  'Thông tin hồ sơ thần đã tồn tại'
)
