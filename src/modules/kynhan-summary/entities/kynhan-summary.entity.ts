import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const KyNhanSummarySchema = z.object({
  id: z.number(),

  kyNhanId: z.number(),
  questionId: z.number().nullable(),

  summary: z.string().nullable(),
  imgUrl: z.string().url().nullable(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateKyNhanSummaryBodySchema = KyNhanSummarySchema.pick({
  kyNhanId: true,
  questionId: true,
  summary: true,
  imgUrl: true
})
  .extend({
    imgUrl: z.string().url().nullable().optional()
  })
  .strict()

export const CreateKyNhanSummaryResSchema = z.object({
  statusCode: z.number(),
  data: KyNhanSummarySchema,
  message: z.string()
})

export const UpdateKyNhanSummaryBodySchema = CreateKyNhanSummaryBodySchema.partial()

export const UpdateKyNhanSummaryResSchema = CreateKyNhanSummaryResSchema

export const GetKyNhanSummaryParamsSchema = z
  .object({
    kyNhanSummaryId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetKyNhanByQuesIdSummaryParamsSchema = z
  .object({
    questionId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetKyNhanSummaryByLandIdParamsSchema = z
  .object({
    landId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetKyNhanSummaryResSchema = CreateKyNhanSummaryResSchema
export const GetKyNhanSummariesResSchema = z.object({
  statusCode: z.number(),
  data: z.array(KyNhanSummarySchema),
  message: z.string()
})
export const GetKyNhanSummarysByUserResSchema = z.object({
  statusCode: z.number(),
  data: z.array(
    KyNhanSummarySchema.extend({ isAchieved: z.boolean(), point: z.number().default(0) })
  ),
  message: z.string()
})

//type
export type CreateKyNhanSummaryBodyType = z.infer<typeof CreateKyNhanSummaryBodySchema>
export type UpdateKyNhanSummaryBodyType = z.infer<typeof UpdateKyNhanSummaryBodySchema>
export type GetKyNhanSummaryParamsType = z.infer<typeof GetKyNhanSummaryParamsSchema>
export type GetKyNhanByQuesIdSummaryParamsType = z.infer<
  typeof GetKyNhanByQuesIdSummaryParamsSchema
>
export type GetKyNhanSummaryByLandIdParamsType = z.infer<
  typeof GetKyNhanSummaryByLandIdParamsSchema
>
export type KyNhanSummaryTypeType = z.infer<typeof KyNhanSummarySchema>

//field
//field
type KyNhanSummaryFieldType = keyof z.infer<typeof KyNhanSummarySchema>
export const GOD_PROFILE_FIELDS = Object.keys(
  KyNhanSummarySchema.shape
) as KyNhanSummaryFieldType[]
