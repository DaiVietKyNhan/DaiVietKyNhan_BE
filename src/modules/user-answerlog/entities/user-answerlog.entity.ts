import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const UserAnswerLogSchema = z
  .object({
    id: z.number(),

    questionId: z.number(),
    userId: z.number(),

    text: z.string(),
    isCorrect: z.boolean(),

    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateUserAnswerLogBodySchema = UserAnswerLogSchema.pick({
  text: true,
  questionId: true
})

  .strict()

export const CreateUserAnswerLogResSchema = z.object({
  statusCode: z.number(),
  data: UserAnswerLogSchema,
  message: z.string()
})

export const UpdateUserAnswerLogBodySchema =
  CreateUserAnswerLogBodySchema.partial().strict()

export const UpdateUserAnswerLogResSchema = z.object({
  statusCode: z.number(),
  data: UserAnswerLogSchema,
  message: z.string()
})

export const GetUserAnswerLogParamsSchema = z
  .object({
    userAnswerLogId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetUserAnswerLogResSchema = z
  .object({
    statusCode: z.number(),
    data: UserAnswerLogSchema,
    message: z.string()
  })
  .strict()

// Types
export type UserAnswerLogType = z.infer<typeof UserAnswerLogSchema>
export type CreateUserAnswerLogBodyType = z.infer<typeof CreateUserAnswerLogBodySchema>
export type UpdateUserAnswerLogBodyType = z.infer<typeof UpdateUserAnswerLogBodySchema>
export type GetUserAnswerLogParamsType = z.infer<typeof GetUserAnswerLogParamsSchema>
export type GetUserAnswerLogResType = z.infer<typeof GetUserAnswerLogResSchema>

//field
type UserAnswerLogFieldType = keyof z.infer<typeof UserAnswerLogSchema>
export const USERANSWERLOG_FIELDS = Object.keys(
  UserAnswerLogSchema.shape
) as UserAnswerLogFieldType[]
