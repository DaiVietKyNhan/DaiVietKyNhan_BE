import { z } from 'zod'
import { patchNestJsSwagger } from 'nestjs-zod'

patchNestJsSwagger()

export const AchievementSchema = z
    .object({
        id: z.number(),
        name: z.string().max(500),
        description: z.string().max(1000).nullable(),
        type: z.enum(['KY_NHAN_SUMMARY_COUNT', 'LAND_COLLECTION', 'ALL_LANDS_COLLECTED']),
        requirement: z.number().min(1),
        reward: z.number().min(0),
        isActive: z.boolean(),
        order: z.number().min(0),
        landId: z.number().nullable(),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
    .strict()

export const CreateAchievementBodySchema = AchievementSchema.pick({
    name: true,
    description: true,
    type: true,
    requirement: true,
    reward: true,
    isActive: true,
    landId: true
})

export const UpdateAchievementBodySchema = CreateAchievementBodySchema.partial()

export const GetAchievementResSchema = AchievementSchema.extend({
    land: z.object({
        id: z.number(),
        name: z.string(),
        order: z.number()
    }).nullable().optional()
}).strict()

export const GetAchievementListResSchema = z.object({
    results: z.array(GetAchievementResSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number()
})

// Types
export type AchievementType = z.infer<typeof AchievementSchema>
export type CreateAchievementBodyType = z.infer<typeof CreateAchievementBodySchema>
export type UpdateAchievementBodyType = z.infer<typeof UpdateAchievementBodySchema>
export type GetAchievementResType = z.infer<typeof GetAchievementResSchema>
export type GetAchievementListResType = z.infer<typeof GetAchievementListResSchema>

//field
type AchievementFieldType = keyof z.infer<typeof AchievementSchema>
export const ACHIEVEMENT_FIELDS = Object.keys(AchievementSchema.shape) as AchievementFieldType[]
