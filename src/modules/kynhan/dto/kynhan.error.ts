import { ConflictException } from '@nestjs/common'

export const KynhanAlreadyExistsException = new ConflictException(
  'Tên kỳ nhân này đã tồn này'
)
