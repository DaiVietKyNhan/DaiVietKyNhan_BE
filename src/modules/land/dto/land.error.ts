import { ConflictException } from '@nestjs/common'

export const LandAlreadyExistsException = new ConflictException('Tên vùng này đã tồn tại')
