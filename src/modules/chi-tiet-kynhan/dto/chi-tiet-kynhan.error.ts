import { ConflictException } from '@nestjs/common'

export const ChiTietKyNhanAlreadyExistsException = new ConflictException(
    'Chi tiết kỳ nhân đã tồn tại'
)
