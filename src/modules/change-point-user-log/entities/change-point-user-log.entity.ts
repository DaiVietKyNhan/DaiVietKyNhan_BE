import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const ChangePointUserLogSchema = z
  .object({
    id: z.number(),

    userId: z.number(),
    reason: z.string(),
    newPoint: z.number().min(0),
    newCoin: z.number().min(0),
    newHeart: z.number().min(0).max(3),

    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateChangePointUserLogBodySchema = ChangePointUserLogSchema.pick({
  userId: true,
  reason: true,
  newPoint: true,
  newCoin: true,
  newHeart: true
}).strict()

export const CreateChangePointUserLogResSchema = z.object({
  statusCode: z.number(),
  data: ChangePointUserLogSchema,
  message: z.string()
})

export const UpdateChangePointUserLogBodySchema = ChangePointUserLogSchema.pick({
  newPoint: true,
  newCoin: true,
  newHeart: true,
  reason: true
})
  .partial()
  .strict()

export const UpdateChangePointUserLogResSchema = z.object({
  statusCode: z.number(),
  data: ChangePointUserLogSchema,
  message: z.string()
})

export const GetChangePointUserLogParamsSchema = z
  .object({
    id: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetChangePointUserLogResSchema = z.object({
  statusCode: z.number(),
  data: ChangePointUserLogSchema,
  message: z.string()
})

export const ListChangePointUserLogQuerySchema = z
  .object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    userId: z.coerce.number().optional()
  })
  .strict()

export const ListChangePointUserLogResSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    items: z.array(ChangePointUserLogSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number()
    })
  }),
  message: z.string()
})

export const DeleteChangePointUserLogParamsSchema = z
  .object({
    id: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const DeleteChangePointUserLogResSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    id: z.number()
  }),
  message: z.string()
})

export type ChangePointUserLogType = z.infer<typeof ChangePointUserLogSchema>
export type CreateChangePointUserLogBodyType = z.infer<
  typeof CreateChangePointUserLogBodySchema
>
export type UpdateChangePointUserLogBodyType = z.infer<
  typeof UpdateChangePointUserLogBodySchema
>
export type ListChangePointUserLogQueryType = z.infer<
  typeof ListChangePointUserLogQuerySchema
>

type ChangePointUserLogFieldType = keyof z.infer<typeof ChangePointUserLogSchema>
export const CHANGE_POINT_USER_LOG_FIELDS = Object.keys(
  ChangePointUserLogSchema.shape
) as ChangePointUserLogFieldType[]
