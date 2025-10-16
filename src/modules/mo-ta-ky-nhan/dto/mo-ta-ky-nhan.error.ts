import { ConflictException } from '@nestjs/common'

export const MotaKyNhanAlreadyExistsException = new ConflictException(
  'Mô tả kỳ nhân này đã tồn tại'
)
