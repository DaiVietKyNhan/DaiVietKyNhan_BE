import { AnswerScaleType } from '@/common/constants/text-question-home.constant'
import { checkIdSchema } from '@/common/utils/id.validation'
import { TestQuestionHomeSchema } from '@/modules/test-question-home/entities/test-question-home.entity'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const UserTestQuestionHomeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  questionId: z.number(),
  answer: z.enum([
    AnswerScaleType.STRONGLY_DISAGREE,
    AnswerScaleType.DISAGREE,
    AnswerScaleType.NEUTRAL,
    AnswerScaleType.AGREE,
    AnswerScaleType.STRONGLY_AGREE
  ]),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const UserTestQuestionHomeWithQuestionSchema = UserTestQuestionHomeSchema.extend({
  question: TestQuestionHomeSchema
})

export const CreateUserTestQuestionHomeBodySchema = UserTestQuestionHomeSchema.pick({
  answer: true,
  questionId: true
}).strict()

export const CreateUserTestQuestionHomeResSchema = z.object({
  statusCode: z.number(),
  data: UserTestQuestionHomeSchema.extend({
    pointHome: z.boolean().optional()
  }),
  message: z.string()
})

export const UpdateUserTestQuestionHomeBodySchema =
  CreateUserTestQuestionHomeBodySchema.partial()

export const UpdateUserTestQuestionHomeResSchema = CreateUserTestQuestionHomeResSchema

export const GetQuestionHomeParamsSchema = z
  .object({
    userTestQuestionHomeId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetUserTestQuestionHomeResSchema = CreateUserTestQuestionHomeResSchema

//type
export type CreateUserTestQuestionHomeBodyType = z.infer<
  typeof CreateUserTestQuestionHomeBodySchema
>
export type UpdateUserTestQuestionHomeBodyType = z.infer<
  typeof UpdateUserTestQuestionHomeBodySchema
>
export type GetQuestionHomeParamsType = z.infer<typeof GetQuestionHomeParamsSchema>
export type UserTestQuestionHomeTypeType = z.infer<typeof UserTestQuestionHomeSchema>

export type UserTestQuestionHomeWithQuestionType = z.infer<
  typeof UserTestQuestionHomeWithQuestionSchema
>
//field
//field
type UserTestQuestionHomeFieldType = keyof z.infer<typeof UserTestQuestionHomeSchema>
export const USER_TEST_QUESTION_HOME_FIELDS = Object.keys(
  UserTestQuestionHomeSchema.shape
) as UserTestQuestionHomeFieldType[]
