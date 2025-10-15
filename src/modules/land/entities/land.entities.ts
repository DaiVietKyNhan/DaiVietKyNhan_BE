import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const LandSchema = z
  .object({
    id: z.number(),
    name: z.string().max(500),
    description: z.string().max(1000),
    order: z.number().int().min(1)
  })
  .strict()

export const CreateLandBodySchema = LandSchema.pick({
  name: true,
  description: true,
  order: true
}).strict()

export const UpdateLandBodySchema = CreateLandBodySchema.partial().strict()

export type LandType = z.infer<typeof LandSchema>
export type CreateLandBodyType = z.infer<typeof CreateLandBodySchema>
export type UpdateLandBodyType = z.infer<typeof UpdateLandBodySchema>
