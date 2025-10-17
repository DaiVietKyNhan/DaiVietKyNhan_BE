import { createZodDto } from 'nestjs-zod'
import { CreateUserAchievementBodySchema, UpdateUserAchievementBodySchema } from '../entities/user-achievement.entity'

export class CreateUserAchievementBodyDTO extends createZodDto(
    CreateUserAchievementBodySchema
) { }

export class UpdateUserAchievementBodyDTO extends createZodDto(
    UpdateUserAchievementBodySchema
) { }
