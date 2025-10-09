import { ENTITY_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const SystemConfigSchema = z.object({
  id: z.number(),
  launchDate: z.coerce.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateSystemConfigBodySchema = SystemConfigSchema.pick({
  launchDate: true
}).strict()

export const CreateSystemConfigResSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: SystemConfigSchema
})

export const UpdateSystemConfigBodySchema = CreateSystemConfigBodySchema
export const UpdateSystemConfigResSchema = CreateSystemConfigResSchema

export const GetParamsSystemConfigSchema = z.object({
  systemConfigId: checkIdSchema(ENTITY_MESSAGE.ID_INVALID)
})

export const GetParamsByDateSystemConfigSchema = z.object({
  date: checkIdSchema(ENTITY_MESSAGE.ID_INVALID)
})

export const GetSystemConfigResSchema = CreateSystemConfigResSchema

//type

export type SystemConfigType = z.infer<typeof SystemConfigSchema>
export type CreateSystemConfigBodyType = z.infer<typeof CreateSystemConfigBodySchema>
export type UpdateSystemConfigBodyType = z.infer<typeof UpdateSystemConfigBodySchema>
export type GetParamsSystemConfigType = z.infer<typeof GetParamsSystemConfigSchema>
export type GetParamsDateSystemConfigType = z.infer<
  typeof GetParamsByDateSystemConfigSchema
>

// field
type SystemConfigFieldType = keyof z.infer<typeof SystemConfigSchema>
export const SYSTEM_CONFIG_FIELDS = Object.keys(
  SystemConfigSchema.shape
) as SystemConfigFieldType[]
