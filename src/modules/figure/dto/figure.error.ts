import { ENTITY_MESSAGE } from '@/common/constants/message'
import { ConflictException } from '@nestjs/common'

export const FigureAlreadyExistsException = new ConflictException(
  ENTITY_MESSAGE.ALREADY_EXISTS
)

export const UserFigureAlreadyExistsException = new ConflictException(
  'Người dùng đã có hình tượng rồi'
)
