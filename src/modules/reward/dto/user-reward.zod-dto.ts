import { PaginationQuerySchema } from '@/shared/models/request.model'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import {
  CreateUserRewardBodySchema,
  ExchangeRewardBodySchema,
  RedeemCodeBodySchema,
  UpdateUserRewardBodySchema
} from '../entities/user-reward.entity'

export class CreateUserRewardBodyDTO extends createZodDto(CreateUserRewardBodySchema) { }

export class UpdateUserRewardBodyDTO extends createZodDto(UpdateUserRewardBodySchema) { }

export class ExchangeRewardBodyDTO extends createZodDto(ExchangeRewardBodySchema) { }

export class RedeemCodeBodyDTO extends createZodDto(RedeemCodeBodySchema) { }

// DTO for filtering user rewards by reward.code and status
export const GetListUserRewardQuerySchema = PaginationQuerySchema.extend({
  rewardCode: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CLAIMED', 'CANCELLED']).optional()
})

export type GetListUserRewardQueryType = z.infer<typeof GetListUserRewardQuerySchema>

export class GetListUserRewardQueryDTO extends createZodDto(
  GetListUserRewardQuerySchema
) { }
