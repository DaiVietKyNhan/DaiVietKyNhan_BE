import { ConflictException } from '@nestjs/common'

export const LandAlreadyExistsException = new ConflictException('Tên vùng này đã tồn tại')

export const LandNotOpenedException = new ConflictException('Vùng này chưa đến ngày mở')
