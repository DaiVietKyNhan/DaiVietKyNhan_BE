export const TestQuestionHomeType = {
  NORMAL: 'NORMAL',
  CONVERT: 'CONVERT'
} as const
export type TestQuestionHomeTypeType =
  (typeof TestQuestionHomeType)[keyof typeof TestQuestionHomeType]

export const TestQuestionHomeTraitType = {
  CHOLERIC: 'CHOLERIC',
  SANGUINE: 'SANGUINE',
  MELANCHOLIC: 'MELANCHOLIC',
  PHLEGMATIC: 'PHLEGMATIC'
} as const

export type TestQuestionHomeTraitTypeType =
  (typeof TestQuestionHomeTraitType)[keyof typeof TestQuestionHomeTraitType]

export const AnswerScaleType = {
  STRONGLY_DISAGREE: 'STRONGLY_DISAGREE',
  DISAGREE: 'DISAGREE',
  NEUTRAL: 'NEUTRAL',
  AGREE: 'AGREE',
  STRONGLY_AGREE: 'STRONGLY_AGREE'
} as const

export type AnswerScaleTypeType = keyof typeof AnswerScaleType
