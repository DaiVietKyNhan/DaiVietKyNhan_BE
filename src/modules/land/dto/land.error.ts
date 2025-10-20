import { ConflictException } from '@nestjs/common'

export const LandAlreadyExistsException = new ConflictException('Tên vùng này đã tồn tại')

export const LandNotOpenedException = new ConflictException('Vùng này chưa đến ngày mở')

export const LandNotOpenedForUserException = new ConflictException(
  'Bạn chưa được mở vùng này'
)
