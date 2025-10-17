import { ENTITY_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/common/utils/id.validation'
import { KyNhanSchema } from '@/modules/kynhan/entities/kynhan.entities'
import { MotaKyNhanSchema } from '@/modules/mo-ta-ky-nhan/entities/mo-ta-ky-nhan.entity'
import { RoleSchema } from '@/shared/models/shared-role.model'
import { UserSchema } from '@/shared/models/shared-user.model'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
extendZodWithOpenApi(z)
patchNestJsSwagger()

export const CreateUserBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
  gender: true,
  birthDate: true,
  roleId: true
})
  .strict()
  .extend({
    confirmPassword: z
      .string()
      .min(6)
      .max(255)
      .openapi({ description: 'Confirm password must match password' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password and confirm password do not match',
    path: ['confirmPassword']
  })
export const CreateUserResSchema = z.object({
  statusCode: z.number(),
  data: UserSchema.omit({ password: true }),
  message: z.string()
})

export const UpdateUserBodySchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  gender: true,
  birthDate: true,
  avatar: true,
  coin: true,
  status: true,
  roleId: true,
  password: true
})
  .partial()
  .strict()
  .refine((data) => {
    if (data.password) {
      return data.password.length >= 6 && data.password.length <= 255
    }
    return true
  })

export const GetKyNhansByUserSchema = z.object({
  ...UserSchema.shape,
  userKynhans: z.array(
    z
      .object({
        ...KyNhanSchema.shape,
        motaKyNhan: MotaKyNhanSchema.nullable()
      })
      .nullable()
  )
})

export const GetKyNhansByUserResSchema = z.object({
  statusCode: z.number(),
  data: GetKyNhansByUserSchema,
  message: z.string()
})

export const UpdateUserResSchema = CreateUserResSchema

export const GetParamsUserSchema = z.object({
  userId: checkIdSchema(ENTITY_MESSAGE.ID_INVALID)
})

export const GetParamsIdOrEmailSchema = z.object({
  identifier: z.union([
    z
      .string()
      .regex(/^\d+$/, ENTITY_MESSAGE.INVALID_PARAMS)
      .transform((val) => Number(val)),
    z.string().email(ENTITY_MESSAGE.INVALID_PARAMS)
  ])
})

export const GetUserWithRoleResSchema = z.object({
  statusCode: z.number(),
  data: UserSchema.omit({ password: true }).extend({
    role: RoleSchema.pick({ id: true, name: true, description: true })
  }),
  message: z.string()
})
export type GetKyNhansByUserSchemaType = z.infer<typeof GetKyNhansByUserSchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type GetParamsUserType = z.infer<typeof GetParamsUserSchema>
export type GetParamsIdOrEmailType = z.infer<typeof GetParamsIdOrEmailSchema>

// field cho qs
type UserFieldType = keyof z.infer<typeof UserSchema>
export const USER_FIELDS = Object.keys(UserSchema.shape) as UserFieldType[]
