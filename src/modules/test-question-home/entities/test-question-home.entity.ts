import {
  AnswerScaleType,
  TestQuestionHomeTraitType,
  TestQuestionHomeType
} from '@/common/constants/text-question-home.constant'
import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const TestQuestionHomeSchema = z.object({
  id: z.number(),
  text: z.string().min(1),
  testQuestionHomeType: z
    .enum([TestQuestionHomeType.NORMAL, TestQuestionHomeType.CONVERT])
    .default(TestQuestionHomeType.NORMAL),
  testType: z
    .enum([
      TestQuestionHomeTraitType.CHOLERIC,
      TestQuestionHomeTraitType.SANGUINE,
      TestQuestionHomeTraitType.MELANCHOLIC,
      TestQuestionHomeTraitType.PHLEGMATIC
    ])
    .nullable(),
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

export const CreateTestQuestionHomeBodySchema = TestQuestionHomeSchema.pick({
  text: true,
  testQuestionHomeType: true,
  answer: true,
  testType: true
}).strict()

export const CreateTestQuestionHomeResSchema = z.object({
  statusCode: z.number(),
  data: TestQuestionHomeSchema,
  message: z.string()
})

export const UpdateTestQuestionHomeBodySchema = CreateTestQuestionHomeBodySchema.partial()

export const UpdateTestQuestionHomeResSchema = CreateTestQuestionHomeResSchema

export const GetQuestionHomeParamsSchema = z
  .object({
    testQuestionHomeId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetTestQuestionHomeResSchema = CreateTestQuestionHomeResSchema

//type
export type CreateTestQuestionHomeBodyType = z.infer<
  typeof CreateTestQuestionHomeBodySchema
>
export type UpdateTestQuestionHomeBodyType = z.infer<
  typeof UpdateTestQuestionHomeBodySchema
>
export type GetQuestionHomeParamsType = z.infer<typeof GetQuestionHomeParamsSchema>
export type TestQuestionHomeTypeType = z.infer<typeof TestQuestionHomeSchema>

//field
//field
type TestQuestionHomeFieldType = keyof z.infer<typeof TestQuestionHomeSchema>
export const TEST_QUESTION_HOME_FIELDS = Object.keys(
  TestQuestionHomeSchema.shape
) as TestQuestionHomeFieldType[]
