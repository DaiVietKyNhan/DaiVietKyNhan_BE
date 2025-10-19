import { checkIdSchema } from '@/common/utils/id.validation'
import { LandBargeSchema } from '@/modules/land-barge/entities/land-barge.entity'
import { LandSchema } from '@/modules/land/entities/land.entity'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const UserLandBargeSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    landBargeId: z.number(),
    status: z.boolean().default(true),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateUserLandBargeBodySchema = UserLandBargeSchema.pick({
  userId: true,
  landBargeId: true
}).strict()

export const CreateUserLandBargeResSchema = z.object({
  statusCode: z.number(),
  data: UserLandBargeSchema,
  message: z.string()
})

export const UpdateUserLandBargeBodySchema = CreateUserLandBargeBodySchema.extend({
  status: z.boolean().optional()
})
  .partial()
  .strict()

export const UpdateUserLandBargeResSchema = z.object({
  statusCode: z.number(),
  data: UserLandBargeSchema,
  message: z.string()
})

export const GetUserLandBargeParamsSchema = z
  .object({
    userLandBargeId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetUserLandBargeWithLandIdParamsSchema = z
  .object({
    landId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetUserLandBargeResSchema = z
  .object({
    statusCode: z.number(),
    data: UserLandBargeSchema.extend({
      land: LandBargeSchema.optional()
    }),
    message: z.string()
  })
  .strict()

export const UserLandBargeWithLandBargeSchema = UserLandBargeSchema.extend({
  landBarge: LandBargeSchema.nullable().optional()
})

export const GetUserLandBargesResSchema = z
  .object({
    statusCode: z.number(),
    data: z.array(
      UserLandBargeSchema.extend({
        landBarge: LandBargeSchema.extend({
          land: LandSchema.nullable()
        }).nullable()
      })
    ),
    message: z.string()
  })
  .strict()

export const CreateUserLandBargeListResSchema = z.object({
  statusCode: z.number(),
  data: z.array(
    z.object({
      ...UserLandBargeSchema.extend({
        landBarge: LandBargeSchema.nullable()
      }).shape
    })
  ),
  message: z.string()
})

// Types
export type UserLandBargeType = z.infer<typeof UserLandBargeSchema>
export type UserLandBargeWithLandBargeSchemaType = z.infer<
  typeof UserLandBargeWithLandBargeSchema
>

export type CreateUserLandBargeBodyType = z.infer<typeof CreateUserLandBargeBodySchema>
export type UpdateUserLandBargeBodyType = z.infer<typeof UpdateUserLandBargeBodySchema>
export type GetUserLandBargeParamsType = z.infer<typeof GetUserLandBargeParamsSchema>
export type GetUserLandBargeResType = z.infer<typeof GetUserLandBargeResSchema>
export type CreateUserLandBargeListResType = z.infer<
  typeof CreateUserLandBargeListResSchema
>

//field
type UserLandBargeFieldType = keyof z.infer<typeof UserLandBargeSchema>
export const UserLandBarge_FIELDS = Object.keys(
  UserLandBargeSchema.shape
) as UserLandBargeFieldType[]
