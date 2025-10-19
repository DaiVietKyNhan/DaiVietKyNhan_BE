import { TestQuestionHomeTraitType } from '@/common/constants/text-question-home.constant'
import { checkIdSchema } from '@/common/utils/id.validation'
import { TestQuestionHomeSchema } from '@/modules/test-question-home/entities/test-question-home.entity'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const GodProfileSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  textEmotion: z.string().min(1),
  order: z.number().min(0),
  traitType: z
    .enum([
      TestQuestionHomeTraitType.CHOLERIC,
      TestQuestionHomeTraitType.SANGUINE,
      TestQuestionHomeTraitType.MELANCHOLIC,
      TestQuestionHomeTraitType.PHLEGMATIC
    ])
    .nullable(),
  description: z.string().min(1),
  imgUrl: z.string().url().nullable(),
  text_color: z.string().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const GodProfileWithQuestionSchema = GodProfileSchema.extend({
  question: TestQuestionHomeSchema
})

export const CreateGodProfileBodySchema = GodProfileSchema.pick({
  title: true,
  textEmotion: true,
  order: true,
  traitType: true,
  description: true,
  imgUrl: true,
  text_color: true
}).strict()

export const CreateGodProfileResSchema = z.object({
  statusCode: z.number(),
  data: GodProfileSchema,
  message: z.string()
})

export const UpdateGodProfileBodySchema = CreateGodProfileBodySchema.partial()

export const UpdateGodProfileResSchema = CreateGodProfileResSchema

export const GetQuestionHomeParamsSchema = z
  .object({
    godProfileId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetGodProfileResSchema = CreateGodProfileResSchema
export const GetGodProfilesByUserResSchema = z.object({
  statusCode: z.number(),
  data: z.array(
    GodProfileSchema.extend({ isAchieved: z.boolean(), point: z.number().default(0) })
  ),
  message: z.string()
})

//type
export type CreateGodProfileBodyType = z.infer<typeof CreateGodProfileBodySchema>
export type UpdateGodProfileBodyType = z.infer<typeof UpdateGodProfileBodySchema>
export type GetQuestionHomeParamsType = z.infer<typeof GetQuestionHomeParamsSchema>
export type GodProfileTypeType = z.infer<typeof GodProfileSchema>

export type GodProfileWithQuestionType = z.infer<typeof GodProfileWithQuestionSchema>
//field
//field
type GodProfileFieldType = keyof z.infer<typeof GodProfileSchema>
export const GOD_PROFILE_FIELDS = Object.keys(
  GodProfileSchema.shape
) as GodProfileFieldType[]
