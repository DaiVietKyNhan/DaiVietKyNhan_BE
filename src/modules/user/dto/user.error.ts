import { BadRequestException } from '@nestjs/common'

export const UserNotEnoughCoinException = new BadRequestException(
  'Bạn không đủ xu để mua thêm trái tim'
)

export const UserMaxHeartException = new BadRequestException(
  'Bạn đã đạt số trái tim tối đa'
)
