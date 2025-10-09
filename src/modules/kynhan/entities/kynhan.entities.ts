import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const KyNhanSchema = z
  .object({
    id: z.number(),
    name: z.string().max(500),
    thoiKy: z.string().max(500),
    chienCong: z.string(),
    imgUrl: z.string().max(1000).nullable(),
    active: z.boolean().default(false),
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
  imgUrl: true,
  active: true
}).strict()

export const UpdateKyNhanBodySchema = CreateKyNhanBodySchema.partial().strict()

export const QueryKyNhanSchema = z
  .object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).default(10),
    search: z.string().optional(),
    thoiKy: z.string().optional(),
    active: z.boolean().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
  .strict()

export const KyNhanResSchema = z
  .object({
    statusCode: z.number(),
    data: KyNhanSchema,
    message: z.string()
  })
  .strict()

export const KyNhanListResSchema = z
  .object({
    statusCode: z.number(),
    data: z.object({
      data: z.array(KyNhanSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
      })
    }),
    message: z.string()
  })
  .strict()

// Types
export type KyNhanType = z.infer<typeof KyNhanSchema>
export type CreateKyNhanBodyType = z.infer<typeof CreateKyNhanBodySchema>
export type UpdateKyNhanBodyType = z.infer<typeof UpdateKyNhanBodySchema>
export type QueryKyNhanType = z.infer<typeof QueryKyNhanSchema>
export type KyNhanResType = z.infer<typeof KyNhanResSchema>
export type KyNhanListResType = z.infer<typeof KyNhanListResSchema>
