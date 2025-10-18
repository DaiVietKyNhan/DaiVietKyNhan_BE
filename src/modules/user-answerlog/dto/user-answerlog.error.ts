import { ConflictException } from '@nestjs/common'

export const UserAnswerLogAlreadyExistsException = new ConflictException(
  'Bạn đã trả lời câu hỏi này rồi'
)

export const UserAnswerLogIsCorrectExistExistsException = new ConflictException(
  'Bạn đã trả lời đúng câu hỏi này trước đó rồi'
)

export const UserNotEnoughHeartException = new ConflictException(
  'Bạn không đủ tim để trả lời lại câu hỏi này'
)
export const UserNotEnoughCoinException = new ConflictException(
  'Bạn không đủ xu để thực hiện'
)

export const LandNotYetUnlockedException = new ConflictException(
  'Chưa đến thời gian mở vùng đất này'
)

export const AnswerMustBeUniqueAndAtLeastTwoException = new ConflictException(
  'Câu trả lời phải là duy nhất và ít nhất 2 câu trả lời'
)
