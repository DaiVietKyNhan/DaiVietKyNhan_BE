import { checkIdSchema } from '@/common/utils/id.validation'
import { TestQuestionHomeSchema } from '@/modules/test-question-home/entities/test-question-home.entity'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const LandBargeSchema = z.object({
  id: z.number(),
  landId: z.number(),

  imgUrl: z.string().url().nullable(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const LandBargeWithQuestionSchema = LandBargeSchema.extend({
  question: TestQuestionHomeSchema
})

export const CreateLandBargeBodySchema = LandBargeSchema.pick({
  landId: true
}).strict()

export const CreateLandBargeResSchema = z.object({
  statusCode: z.number(),
  data: LandBargeSchema,
  message: z.string()
})

export const UpdateLandBargeBodySchema = CreateLandBargeBodySchema.partial()

export const UpdateLandBargeResSchema = CreateLandBargeResSchema

export const GetQuestionHomeParamsSchema = z
  .object({
    landBargeId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetLandBargeResSchema = CreateLandBargeResSchema
export const GetLandBargesByUserResSchema = z.object({
  statusCode: z.number(),
  data: z.array(
    LandBargeSchema.extend({ isAchieved: z.boolean(), point: z.number().default(0) })
  ),
  message: z.string()
})

//type
export type CreateLandBargeBodyType = z.infer<typeof CreateLandBargeBodySchema>
export type UpdateLandBargeBodyType = z.infer<typeof UpdateLandBargeBodySchema>
export type GetQuestionHomeParamsType = z.infer<typeof GetQuestionHomeParamsSchema>
export type LandBargeTypeType = z.infer<typeof LandBargeSchema>

export type LandBargeWithQuestionType = z.infer<typeof LandBargeWithQuestionSchema>
//field
//field
type LandBargeFieldType = keyof z.infer<typeof LandBargeSchema>
export const LAND_BARGE_PROFILE_FIELDS = Object.keys(
  LandBargeSchema.shape
) as LandBargeFieldType[]
