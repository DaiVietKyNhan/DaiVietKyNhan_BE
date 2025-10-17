export const QuestionType = {
  TEXT_INPUT: 'TEXT_INPUT'
} as const

export type QuestionTypeType = (typeof QuestionType)[keyof typeof QuestionType]
