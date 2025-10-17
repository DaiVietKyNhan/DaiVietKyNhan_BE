import { z } from 'zod'
import { patchNestJsSwagger } from 'nestjs-zod'

patchNestJsSwagger()

export const UserAchievementSchema = z
    .object({
        id: z.number(),
        userId: z.number(),
        achievementId: z.number(),
        status: z.enum(['PENDING', 'COMPLETED', 'CLAIMED']),
        completedAt: z.date().nullable(),
        rewardClaimed: z.boolean(),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
    .strict()

export const CreateUserAchievementBodySchema = UserAchievementSchema.pick({
    userId: true,
    achievementId: true,
    status: true,
    completedAt: true,
    rewardClaimed: true
})

export const UpdateUserAchievementBodySchema = CreateUserAchievementBodySchema.partial()

export const GetUserAchievementResSchema = UserAchievementSchema.extend({
    achievement: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        type: z.enum(['KY_NHAN_SUMMARY_COUNT', 'LAND_COLLECTION']),
        requirement: z.number(),
        reward: z.number(),
        isActive: z.boolean(),
        order: z.number(),
        land: z.object({
            id: z.number(),
            name: z.string(),
            order: z.number()
        }).nullable().optional()
    })
}).strict()

export const GetUserAchievementListResSchema = z.object({
    results: z.array(GetUserAchievementResSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number()
})

// Types
export type UserAchievementType = z.infer<typeof UserAchievementSchema>
export type CreateUserAchievementBodyType = z.infer<typeof CreateUserAchievementBodySchema>
export type UpdateUserAchievementBodyType = z.infer<typeof UpdateUserAchievementBodySchema>
export type GetUserAchievementResType = z.infer<typeof GetUserAchievementResSchema>
export type GetUserAchievementListResType = z.infer<typeof GetUserAchievementListResSchema>

//field
type UserAchievementFieldType = keyof z.infer<typeof UserAchievementSchema>
export const USER_ACHIEVEMENT_FIELDS = Object.keys(UserAchievementSchema.shape) as UserAchievementFieldType[]
