import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

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
