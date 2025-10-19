import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const KyNhanSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1).max(500),
    thoiKy: z.string().min(1),
    chienCong: z.string().min(1),
    imgUrl: z.string().max(1000).nullable(),
    active: z.boolean().default(false),
    landId: z.number().nullable(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateKyNhanBodySchema = KyNhanSchema.pick({
  name: true,
  thoiKy: true,
  chienCong: true,
  landId: true,
  imgUrl: true,
  active: true
}).strict()

export const CreateKyNhanResSchema = z.object({
  statusCode: z.number(),
  data: KyNhanSchema,
  message: z.string()
})


export const GetKyNhansUserSchema = z.array(
  KyNhanSchema.extend({
    unlocked: z.boolean().default(false)
  })
)

export const GetKyNhansUserResSchema = z.object({
  statusCode: z.number(),
  data: GetKyNhansUserSchema,
  message: z.string()
})

export const UpdateKyNhanBodySchema = CreateKyNhanBodySchema.partial().strict()

export const UpdateKyNhanResSchema = z.object({
  statusCode: z.number(),
  data: KyNhanSchema,
  message: z.string()
})

export const GetKyNhanParamsSchema = z
  .object({
    kyNhanId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetKyNhanResSchema = z
  .object({
    statusCode: z.number(),
    data: KyNhanSchema,
    message: z.string()
  })
  .strict()

// Types
export type KyNhanType = z.infer<typeof KyNhanSchema>
export type CreateKyNhanBodyType = z.infer<typeof CreateKyNhanBodySchema>
export type UpdateKyNhanBodyType = z.infer<typeof UpdateKyNhanBodySchema>
export type GetKyNhanParamsType = z.infer<typeof GetKyNhanParamsSchema>
export type GetKyNhanResType = z.infer<typeof GetKyNhanResSchema>

//field
type KyNhanFieldType = keyof z.infer<typeof KyNhanSchema>
export const KYNHAN_FIELDS = Object.keys(KyNhanSchema.shape) as KyNhanFieldType[]
