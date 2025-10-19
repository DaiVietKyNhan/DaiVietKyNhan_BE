import { ConflictException } from '@nestjs/common'

export const ChangePointUserLogAlreadyExistsException = new ConflictException(
  'Câu trả lời này đã tồn tại'
)

export const MaxChangePointUserLogPerQuestionExceededException = new ConflictException(
  'Câu hỏi này đã đạt đến số lượng câu trả lời tối đa cho phép'
)
