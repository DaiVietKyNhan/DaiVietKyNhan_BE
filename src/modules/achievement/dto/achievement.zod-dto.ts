import { createZodDto } from 'nestjs-zod'
import { CreateAchievementBodySchema, UpdateAchievementBodySchema } from '../entities/achievement.entity'

export class CreateAchievementBodyDTO extends createZodDto(
    CreateAchievementBodySchema
) { }

export class UpdateAchievementBodyDTO extends createZodDto(
    UpdateAchievementBodySchema
) { }
