import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { createZodDto, patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

// User play stats (current + percent change vs previous month)
export const UserPlayStatsSchema = z.object({
  totalUser: z.number(),
  totalPlays: z.number(),
  ratemonthPre: z.number(), // percent change in user count vs previous month
  ratePlayPre: z.number() // percent change in total plays vs previous month
})

export const UserPlayStatsResSchema = z.object({
  statusCode: z.number(),
  data: UserPlayStatsSchema,
  message: z.string()
})

export class UserPlayStatsResDTO extends createZodDto(UserPlayStatsResSchema) {}

const DashboardStatSchema = z.object({
  value: z.union([z.number(), z.string()]),
  change: z.string(),
  title: z.string()
})

const DashboardStatsSchema = z.object({
  totalUsers: DashboardStatSchema,
  webVisits: DashboardStatSchema,
  questions: DashboardStatSchema,
  interaction: DashboardStatSchema
})

export const DashboardStatsResSchema = z.object({
  statusCode: z.number(),
  data: DashboardStatsSchema,
  message: z.string()
})

export const QuestionStatsSchema = z.object({
  countQuestion: z.number(),
  rateCorrect: z.number()
})

export const QuestionStatsResSchema = z.object({
  statusCode: z.number(),
  data: QuestionStatsSchema,
  message: z.string()
})

export class DashboardStatsResDTO extends createZodDto(DashboardStatsResSchema) {}
export class QuestionStatsResDTO extends createZodDto(QuestionStatsResSchema) {}

// Points stats
export const PointsStatsSchema = z.object({
  averagePoint: z.number(),
  maxPoint: z.number(),
  totalUserLargePoint: z.number()
})

export const PointsStatsResSchema = z.object({
  statusCode: z.number(),
  data: PointsStatsSchema,
  message: z.string()
})

export class PointsStatsResDTO extends createZodDto(PointsStatsResSchema) {}

// User stats by month
export const MonthlyUserStatsSchema = z.object({
  month: z.number(),
  monthName: z.string(),
  newUsers: z.number(),
  changePercent: z.number(),
  totalPlays: z.number(),
  passRate: z.number()
})

export const UserStatsResSchema = z.object({
  statusCode: z.number(),
  data: z.array(MonthlyUserStatsSchema),
  message: z.string()
})

export class UserStatsResDTO extends createZodDto(UserStatsResSchema) {}

// Top players leaderboard
export const TopPlayerSchema = z.object({
  userId: z.number(),
  name: z.string(),
  totalAnswers: z.number(),
  correctRate: z.number(),
  currentPoints: z.number()
})

export const TopPlayersResSchema = z.object({
  statusCode: z.number(),
  data: z.array(TopPlayerSchema),
  message: z.string()
})

export class TopPlayersResDTO extends createZodDto(TopPlayersResSchema) {}

// Land statistics
export const LandStatsItemSchema = z.object({
  landId: z.number(),
  landName: z.string(),
  totalAnswers: z.number(),
  averagePoints: z.number(),
  completionRate: z.number()
})

export const LandStatsResSchema = z.object({
  statusCode: z.number(),
  data: z.array(LandStatsItemSchema),
  message: z.string()
})

export class LandStatsResDTO extends createZodDto(LandStatsResSchema) {}
