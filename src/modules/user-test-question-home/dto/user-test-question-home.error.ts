import { ConflictException } from '@nestjs/common'

export const UserTestQuestionHomeAlreadyExistsException = new ConflictException(
  'Bạn đã trả lời câu hỏi này rồi!'
)
