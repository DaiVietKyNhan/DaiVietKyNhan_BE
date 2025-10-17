import { ConflictException } from '@nestjs/common'

export const UserAnswerLogAlreadyExistsException = new ConflictException(
  'Bạn đã trả lời câu hỏi này rồi'
)

export const UserAnswerLogIsCorrectExistExistsException = new ConflictException(
  'Bạn đã trả lời đúng câu hỏi này trước đó rồi'
)
