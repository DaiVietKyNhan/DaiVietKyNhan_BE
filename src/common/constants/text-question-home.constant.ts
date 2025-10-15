export const TestQuestionHomeType = {
  NORMAL: 'NORMAL',
  CONVERT: 'CONVERT'
} as const
export type TestQuestionHomeTypeType =
  (typeof TestQuestionHomeType)[keyof typeof TestQuestionHomeType]

export const AnswerScaleType = {
  STRONGLY_DISAGREE: 'STRONGLY_DISAGREE',
  DISAGREE: 'DISAGREE',
  NEUTRAL: 'NEUTRAL',
  AGREE: 'AGREE',
  STRONGLY_AGREE: 'STRONGLY_AGREE'
} as const

export type AnswerScaleTypeType = keyof typeof AnswerScaleType
