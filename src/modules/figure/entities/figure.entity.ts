import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const FigureSchema = z.object({
  id: z.number(),
  imageUrl: z.string().url().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateFigureBodySchema = FigureSchema.pick({
  imageUrl: true
})
  .partial()
  .strict()

export const CreateFigureResSchema = z.object({
  statusCode: z.number(),
  data: FigureSchema,
  message: z.string()
})

export const UpdateFigureBodySchema = CreateFigureBodySchema.partial()

export const UpdateFigureResSchema = CreateFigureResSchema

export const GetFigureParamsSchema = z
  .object({
    figureId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetFigureResSchema = CreateFigureResSchema

//type
export type CreateFigureBodyType = z.infer<typeof CreateFigureBodySchema>
export type UpdateFigureBodyType = z.infer<typeof UpdateFigureBodySchema>
export type GetFigureParamsType = z.infer<typeof GetFigureParamsSchema>
export type FigureTypeType = z.infer<typeof FigureSchema>

//field
//field
type FigureFieldType = keyof z.infer<typeof FigureSchema>
export const FIGURE_FIELDS = Object.keys(FigureSchema.shape) as FigureFieldType[]
