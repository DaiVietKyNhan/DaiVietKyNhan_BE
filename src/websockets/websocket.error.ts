import { UnauthorizedException } from '@nestjs/common'

export const MissingTokenException = new UnauthorizedException('Thiếu token')

export const InvalidTokenException = new UnauthorizedException('Token không hợp lệ')
