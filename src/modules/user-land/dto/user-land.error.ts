import { ConflictException } from '@nestjs/common'

export const UserLandAlreadyExistsException = new ConflictException(
  'Vùng đất này đã tồn tại'
)
