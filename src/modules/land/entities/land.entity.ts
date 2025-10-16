import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const LandSchema = z
  .object({
    id: z.number(),
    name: z.string().max(500),
    order: z.number().min(0),
    totalQuestion: z.number().min(0),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateLandBodySchema = LandSchema.pick({
  name: true,
  order: true,
  totalQuestion: true
}).strict()

export const CreateLandResSchema = z.object({
  statusCode: z.number(),
  data: LandSchema,
  message: z.string()
})

export const UpdateLandBodySchema = CreateLandBodySchema.partial().strict()

export const UpdateLandResSchema = z.object({
  statusCode: z.number(),
  data: LandSchema,
  message: z.string()
})

export const GetLandParamsSchema = z
  .object({
    landId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetLandResSchema = z
  .object({
    statusCode: z.number(),
    data: LandSchema,
    message: z.string()
  })
  .strict()

// Types
export type LandType = z.infer<typeof LandSchema>
export type CreateLandBodyType = z.infer<typeof CreateLandBodySchema>
export type UpdateLandBodyType = z.infer<typeof UpdateLandBodySchema>
export type GetLandParamsType = z.infer<typeof GetLandParamsSchema>
export type GetLandResType = z.infer<typeof GetLandResSchema>

//field
type LandFieldType = keyof z.infer<typeof LandSchema>
export const LAND_FIELDS = Object.keys(LandSchema.shape) as LandFieldType[]
