import { ConflictException } from '@nestjs/common'

export const AnswerAlreadyExistsException = new ConflictException(
  'Câu trả lời này đã tồn tại'
)

export const MaxAnswerPerQuestionExceededException = new ConflictException(
  'Câu hỏi này đã đạt đến số lượng câu trả lời tối đa cho phép'
)
