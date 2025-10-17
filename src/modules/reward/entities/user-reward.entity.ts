import { z } from 'zod'
import { patchNestJsSwagger } from 'nestjs-zod'

patchNestJsSwagger()

export const UserRewardSchema = z
    .object({
        id: z.number(),
        userId: z.number(),
        rewardId: z.number(),
        status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
        exchangedAt: z.date().nullable(),
        code: z.string().max(100).nullable(),
        valuePaid: z.number().min(0),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
    .strict()

export const CreateUserRewardBodySchema = UserRewardSchema.pick({
    userId: true,
    rewardId: true,
    status: true,
    exchangedAt: true,
    code: true,
    valuePaid: true
})

export const UpdateUserRewardBodySchema = CreateUserRewardBodySchema.partial()

export const ExchangeRewardBodySchema = z.object({
    rewardId: z.number(),
    code: z.string().max(100).optional() // Mã code nếu type = CODE
}).strict()

export const GetUserRewardResSchema = UserRewardSchema.extend({
    reward: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        requireValue: z.number(),
        gift: z.string(),
        type: z.enum(['POINT', 'COIN', 'CODE']),
        limit: z.number().nullable(),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
        isActive: z.boolean(),
        imageUrl: z.string().nullable()
    })
}).strict()

export const GetUserRewardListResSchema = z.object({
    results: z.array(GetUserRewardResSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number()
})

// Types
export type UserRewardType = z.infer<typeof UserRewardSchema>
export type CreateUserRewardBodyType = z.infer<typeof CreateUserRewardBodySchema>
export type UpdateUserRewardBodyType = z.infer<typeof UpdateUserRewardBodySchema>
export type ExchangeRewardBodyType = z.infer<typeof ExchangeRewardBodySchema>
export type GetUserRewardResType = z.infer<typeof GetUserRewardResSchema>
export type GetUserRewardListResType = z.infer<typeof GetUserRewardListResSchema>

//field
type UserRewardFieldType = keyof z.infer<typeof UserRewardSchema>
export const USER_REWARD_FIELDS = Object.keys(UserRewardSchema.shape) as UserRewardFieldType[]
