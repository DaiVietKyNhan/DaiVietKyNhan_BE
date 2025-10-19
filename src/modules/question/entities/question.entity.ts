import { checkIdSchema } from '@/common/utils/id.validation'
import { AnswerSchema } from '@/modules/answer/entities/answer.entity'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { answerOptionType } from '@prisma/client'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const QuestionSchema = z
  .object({
    id: z.number(),

    text: z.string(),
    questionType: z.enum(['TEXT_INPUT']).default('TEXT_INPUT'),
    answerOptionType: z.nativeEnum(answerOptionType).default(answerOptionType.ONE),
    allowSimilarAnswers: z.boolean().default(false),

    point: z.number().default(100),

    landId: z.number(),

    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

const QuestionWithAnswersSchema = QuestionSchema.extend({
  answers: z.array(AnswerSchema)
})

const QuestionWithRateSchema = QuestionSchema.extend({
  rate: z.number().nullable()
})

export const CreateQuestionBodySchema = QuestionSchema.pick({
  text: true,
  questionType: true,
  allowSimilarAnswers: true,
  answerOptionType: true,
  point: true,
  landId: true
})
  .extend({
    kynhanSummaries: z.array(z.number()),
    answers: z.array(z.string().min(1))
  })
  .strict()

export const CreateQuestionResSchema = z.object({
  statusCode: z.number(),
  data: QuestionSchema,
  message: z.string()
})

export const UpdateQuestionBodySchema = CreateQuestionBodySchema.partial().strict()

export const UpdateQuestionResSchema = z.object({
  statusCode: z.number(),
  data: QuestionSchema,
  message: z.string()
})

export const GetQuestionParamsSchema = z
  .object({
    questionId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetQuestionResSchema = z
  .object({
    statusCode: z.number(),
    data: QuestionSchema,
    message: z.string()
  })
  .strict()

// Types
export type QuestionType = z.infer<typeof QuestionSchema>
export type QuestionWithAnswersType = z.infer<typeof QuestionWithAnswersSchema>
export type QuestionWithRateType = z.infer<typeof QuestionWithRateSchema>
export type CreateQuestionBodyType = z.infer<typeof CreateQuestionBodySchema>
export type UpdateQuestionBodyType = z.infer<typeof UpdateQuestionBodySchema>
export type GetQuestionParamsType = z.infer<typeof GetQuestionParamsSchema>
export type GetQuestionResType = z.infer<typeof GetQuestionResSchema>

//field
type QuestionFieldType = keyof z.infer<typeof QuestionSchema>
export const QUESTION_FIELDS = Object.keys(QuestionSchema.shape) as QuestionFieldType[]
