import { UserStatus } from '@/common/constants/auth.constant'
import { AUTH_MESSAGE } from '@/common/constants/message'
import { Gender } from '@/common/constants/user.constant'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1, AUTH_MESSAGE.NAME_IS_REQUIRED).max(100),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(9, AUTH_MESSAGE.PHONE_IS_INVALID).max(15).nullable(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).nullable(),
  birthDate: z.coerce.date().nullable(),
  avatar: z.string().nullable(),
  coin: z.number().min(0).default(0),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export const GetAccountProfileResSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: UserSchema.omit({
    password: true
  }).extend({
    phoneNumber: z.string().nullable(),
    role: RoleSchema.pick({
      id: true,
      name: true
    })
  })
})

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export const UpdateProfileResSchema = z.object({
  data: UserSchema.omit({
    password: true
  }),
  message: z.string()
})

export type UserType = z.infer<typeof UserSchema>
export type GetUserProfileResType = z.infer<typeof GetAccountProfileResSchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
