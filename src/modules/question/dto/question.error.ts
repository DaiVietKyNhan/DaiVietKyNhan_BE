import { ConflictException } from '@nestjs/common'

export const QuestionAlreadyExistsException = new ConflictException(
  'Câu hỏi đã tồn tại trong hệ thống'
)

export const MaxQuestionPerLandExceededException = new ConflictException(
  'Đã đạt đến số lượng câu hỏi tối đa cho vùng đất này'
)

export const QuestionWithTwoAnswersNeededMoreOneException = new ConflictException(
  'Câu hỏi cần nhiều câu trả lời cùng lúc thì cần ít nhất 2 câu trả lời'
)
export const QuestionNeededAtLeastOneException = new ConflictException(
  'Câu hỏi cần ít nhất 1 câu trả lời'
)
