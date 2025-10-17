import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const AnswerSchema = z
  .object({
    id: z.number(),

    text: z.string().min(1),

    questionId: z.number(),

    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateAnswerBodySchema = AnswerSchema.pick({
  text: true,
  questionId: true
})

  .strict()

export const CreateAnswerResSchema = z.object({
  statusCode: z.number(),
  data: AnswerSchema,
  message: z.string()
})

export const UpdateAnswerBodySchema = CreateAnswerBodySchema.partial().strict()

export const UpdateAnswerResSchema = z.object({
  statusCode: z.number(),
  data: AnswerSchema,
  message: z.string()
})

export const GetAnswerParamsSchema = z
  .object({
    answerId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetAnswerResSchema = z
  .object({
    statusCode: z.number(),
    data: AnswerSchema,
    message: z.string()
  })
  .strict()

// Types
export type AnswerType = z.infer<typeof AnswerSchema>
export type CreateAnswerBodyType = z.infer<typeof CreateAnswerBodySchema>
export type UpdateAnswerBodyType = z.infer<typeof UpdateAnswerBodySchema>
export type GetAnswerParamsType = z.infer<typeof GetAnswerParamsSchema>
export type GetAnswerResType = z.infer<typeof GetAnswerResSchema>

//field
type AnswerFieldType = keyof z.infer<typeof AnswerSchema>
export const ANSWER_FIELDS = Object.keys(AnswerSchema.shape) as AnswerFieldType[]
