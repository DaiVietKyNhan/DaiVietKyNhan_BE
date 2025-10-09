import { ENTITY_MESSAGE } from '@/common/constants/message'
import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common'

export const NotFoundRecordException = new NotFoundException(ENTITY_MESSAGE.NOT_FOUND)

export const InvalidPasswordException = new UnauthorizedException('Sai mật khẩu')

export const InvalidOldPasswordException = new UnauthorizedException(
  'Mật khẩu cũ không đúng'
)
export const InValidNewPasswordAndConfirmPasswordException =
  new UnprocessableEntityException('Mật khẩu mới và mật khẩu xác nhận không khớp')
