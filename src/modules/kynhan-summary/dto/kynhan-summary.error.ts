import { ConflictException } from '@nestjs/common'

export const KyNhanSummaryAlreadyExistsException = new ConflictException(
  'Thẻ kỳ nhân đã tồn tại'
)
