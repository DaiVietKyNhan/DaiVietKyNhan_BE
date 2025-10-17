import { ConflictException } from '@nestjs/common'

export const QuestionAlreadyExistsException = new ConflictException(
  'Câu hỏi đã tồn tại trong hệ thống'
)

export const MaxQuestionPerLandExceededException = new ConflictException(
  'Đã đạt đến số lượng câu hỏi tối đa cho vùng đất này'
)
