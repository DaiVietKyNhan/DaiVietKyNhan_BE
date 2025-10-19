import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

patchNestJsSwagger()

// Dashboard Statistics Schema
export const DashboardStatItemSchema = z.object({
    value: z.union([z.number(), z.string()]),
    change: z.string(),
    title: z.string()
}).strict()

export const DashboardStatsSchema = z.object({
    totalUsers: DashboardStatItemSchema,
    webVisits: DashboardStatItemSchema,
    questions: DashboardStatItemSchema,
    interaction: DashboardStatItemSchema
}).strict()

export const DashboardStatsResSchema = z.object({
    statusCode: z.number(),
    data: DashboardStatsSchema,
    message: z.string()
}).strict()

// Types
export type DashboardStatItemType = z.infer<typeof DashboardStatItemSchema>
export type DashboardStatsType = z.infer<typeof DashboardStatsSchema>
export type DashboardStatsResType = z.infer<typeof DashboardStatsResSchema>
