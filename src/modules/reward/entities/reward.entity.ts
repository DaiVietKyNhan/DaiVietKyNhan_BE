import { z } from 'zod'
import { patchNestJsSwagger } from 'nestjs-zod'

patchNestJsSwagger()

export const RewardSchema = z
    .object({
        id: z.number(),
        name: z.string().max(500),
        description: z.string().max(1000).nullable(),
        requireValue: z.number().min(1),
        gift: z.string().max(1000),
        type: z.enum(['POINT', 'COIN', 'CODE']),
        limit: z.number().min(1).nullable(),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
        isActive: z.boolean(),
        imageUrl: z.string().url().nullable(),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
    .strict()

export const CreateRewardBodySchema = RewardSchema.pick({
    name: true,
    description: true,
    requireValue: true,
    gift: true,
    type: true,
    limit: true,
    startDate: true,
    endDate: true,
    isActive: true,
    imageUrl: true
})

export const UpdateRewardBodySchema = CreateRewardBodySchema.partial()

export const GetRewardResSchema = RewardSchema.strict()

export const GetRewardListResSchema = z.object({
    results: z.array(GetRewardResSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number()
})

// Types
export type RewardType = z.infer<typeof RewardSchema>
export type CreateRewardBodyType = z.infer<typeof CreateRewardBodySchema>
export type UpdateRewardBodyType = z.infer<typeof UpdateRewardBodySchema>
export type GetRewardResType = z.infer<typeof GetRewardResSchema>
export type GetRewardListResType = z.infer<typeof GetRewardListResSchema>

//field
type RewardFieldType = keyof z.infer<typeof RewardSchema>
export const REWARD_FIELDS = Object.keys(RewardSchema.shape) as RewardFieldType[]
