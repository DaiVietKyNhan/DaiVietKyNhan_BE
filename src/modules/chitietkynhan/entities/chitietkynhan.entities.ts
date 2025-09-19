import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const ChiTietKyNhanSchema = z.object({
  id: z.number(),
  kyNhanId: z.number(),
  tinhCach: z.string(),
  quanHe: z.string().optional(),
  trichDoan: z.string(),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict()

export const CreateChiTietKyNhanBodySchema = ChiTietKyNhanSchema.pick({
  kyNhanId: true,
  tinhCach: true,
  quanHe: true,
  trichDoan: true
}).strict()

export const UpdateChiTietKyNhanBodySchema = CreateChiTietKyNhanBodySchema.partial().strict()

export const QueryChiTietKyNhanSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).default(10),
  kyNhanId: z.number().int().min(1).optional(),
  tinhCach: z.string().optional(),
  trichDoan: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).strict()

export const ChiTietKyNhanResSchema = z.object({
  statusCode: z.number(),
  data: ChiTietKyNhanSchema,
  message: z.string()
}).strict()

export const ChiTietKyNhanListResSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    data: z.array(ChiTietKyNhanSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number()
    })
  }),
  message: z.string()
}).strict()

// Types
export type ChiTietKyNhanType = z.infer<typeof ChiTietKyNhanSchema>
export type CreateChiTietKyNhanBodyType = z.infer<typeof CreateChiTietKyNhanBodySchema>
export type UpdateChiTietKyNhanBodyType = z.infer<typeof UpdateChiTietKyNhanBodySchema>
export type QueryChiTietKyNhanType = z.infer<typeof QueryChiTietKyNhanSchema>
export type ChiTietKyNhanResType = z.infer<typeof ChiTietKyNhanResSchema>
export type ChiTietKyNhanListResType = z.infer<typeof ChiTietKyNhanListResSchema>
