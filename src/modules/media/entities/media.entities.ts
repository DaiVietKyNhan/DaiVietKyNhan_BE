import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const MediaTypeSchema = z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'])

export const MediaSchema = z.object({
  id: z.number(),
  chiTietId: z.number(),
  type: MediaTypeSchema,
  url: z.string().max(1000),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict()

export const CreateMediaBodySchema = MediaSchema.pick({
  chiTietId: true,
  type: true,
  url: true
}).strict()

export const UpdateMediaBodySchema = CreateMediaBodySchema.partial().strict()

export const QueryMediaSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).default(10),
  chiTietId: z.number().int().min(1).optional(),
  type: MediaTypeSchema.optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).strict()

export const MediaResSchema = z.object({
  statusCode: z.number(),
  data: MediaSchema,
  message: z.string()
}).strict()

export const MediaListResSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    data: z.array(MediaSchema),
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
export type MediaType = z.infer<typeof MediaTypeSchema>
export type MediaSchemaType = z.infer<typeof MediaSchema>
export type CreateMediaBodyType = z.infer<typeof CreateMediaBodySchema>
export type UpdateMediaBodyType = z.infer<typeof UpdateMediaBodySchema>
export type QueryMediaType = z.infer<typeof QueryMediaSchema>
export type MediaResType = z.infer<typeof MediaResSchema>
export type MediaListResType = z.infer<typeof MediaListResSchema>
