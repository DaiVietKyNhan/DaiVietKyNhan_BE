import { UserLandStatus } from '@/common/constants/user-land.constant'
import { checkIdSchema } from '@/common/utils/id.validation'
import { LandSchema } from '@/modules/land/entities/land.entity'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const UserLandSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    landId: z.number(),
    status: z.enum([
      UserLandStatus.COMPLETED,
      UserLandStatus.LOCKED,
      UserLandStatus.PENDING,
      UserLandStatus.LOCKED_FORCED
    ]),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateUserLandBodySchema = UserLandSchema.pick({
  userId: true,
  landId: true,
  status: true
}).strict()

export const CreateUserLandResSchema = z.object({
  statusCode: z.number(),
  data: UserLandSchema,
  message: z.string()
})

export const UpdateUserLandBodySchema = CreateUserLandBodySchema.partial().strict()

export const UpdateUserLandResSchema = z.object({
  statusCode: z.number(),
  data: UserLandSchema,
  message: z.string()
})

export const GetUserLandParamsSchema = z
  .object({
    userLandId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetUserLandResSchema = z
  .object({
    statusCode: z.number(),
    data: UserLandSchema.extend({
      land: LandSchema.optional()
    }),
    message: z.string()
  })
  .strict()

export const GetUserLandsResSchema = z
  .object({
    statusCode: z.number(),
    data: z.array(
      UserLandSchema.extend({
        land: LandSchema.optional()
      })
    ),
    message: z.string()
  })
  .strict()

export const CreateUserLandListResSchema = z.object({
  statusCode: z.number(),
  data: z.array(UserLandSchema),
  message: z.string()
})

// Types
export type UserLandType = z.infer<typeof UserLandSchema>
export type CreateUserLandBodyType = z.infer<typeof CreateUserLandBodySchema>
export type UpdateUserLandBodyType = z.infer<typeof UpdateUserLandBodySchema>
export type GetUserLandParamsType = z.infer<typeof GetUserLandParamsSchema>
export type GetUserLandResType = z.infer<typeof GetUserLandResSchema>
export type CreateUserLandListResType = z.infer<typeof CreateUserLandListResSchema>

//field
type UserLandFieldType = keyof z.infer<typeof UserLandSchema>
export const USERLAND_FIELDS = Object.keys(UserLandSchema.shape) as UserLandFieldType[]
