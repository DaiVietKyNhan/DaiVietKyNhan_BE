import { createZodDto } from 'nestjs-zod'
import { CreateUserRewardBodySchema, UpdateUserRewardBodySchema, ExchangeRewardBodySchema } from '../entities/user-reward.entity'

export class CreateUserRewardBodyDTO extends createZodDto(
    CreateUserRewardBodySchema
) { }

export class UpdateUserRewardBodyDTO extends createZodDto(
    UpdateUserRewardBodySchema
) { }

export class ExchangeRewardBodyDTO extends createZodDto(
    ExchangeRewardBodySchema
) { }
