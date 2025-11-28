import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

patchNestJsSwagger()

export const UserRewardHistorySchema = z
    .object({
        id: z.number(),
        userId: z.number(),
        rewardId: z.number(),
        status: z.enum(['PENDING', 'COMPLETED', 'CLAIMED', 'CANCELLED']),
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

export const GetUserRewardHistoryResSchema = UserRewardHistorySchema.extend({
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
        imageUrl: z.string().nullable(),
        code: z.string().nullable()
    }),
    user: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
        avatar: z.string().nullable()
    })
}).strict()

// Types
export type UserRewardHistoryType = z.infer<typeof UserRewardHistorySchema>
export type GetUserRewardHistoryResType = z.infer<typeof GetUserRewardHistoryResSchema>

// Fields for parseQs
type UserRewardHistoryFieldType = keyof z.infer<typeof UserRewardHistorySchema>
export const USER_REWARD_HISTORY_FIELDS = [
    ...Object.keys(UserRewardHistorySchema.shape),
    'reward.code' // Allow filtering by reward code
] as (UserRewardHistoryFieldType | 'reward.code')[]

