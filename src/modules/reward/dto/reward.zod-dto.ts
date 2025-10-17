import { createZodDto } from 'nestjs-zod'
import { CreateRewardBodySchema, UpdateRewardBodySchema } from '../entities/reward.entity'

export class CreateRewardBodyDTO extends createZodDto(
    CreateRewardBodySchema
) { }

export class UpdateRewardBodyDTO extends createZodDto(
    UpdateRewardBodySchema
) { }
