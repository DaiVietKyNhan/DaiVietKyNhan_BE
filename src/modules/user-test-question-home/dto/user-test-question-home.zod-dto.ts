import { createZodDto } from 'nestjs-zod'
import {
  CreateUserTestQuestionHomeBodySchema,
  CreateUserTestQuestionHomeResSchema,
  GetQuestionHomeParamsSchema,
  GetUserTestQuestionHomeResSchema,
  UpdateUserTestQuestionHomeBodySchema,
  UpdateUserTestQuestionHomeResSchema
} from '../entities/user-test-question-home.entity'

export class CreateUserTestQuestionHomeBodyDTO extends createZodDto(
  CreateUserTestQuestionHomeBodySchema
) {}

export class CreateUserTestQuestionHomeResDTO extends createZodDto(
  CreateUserTestQuestionHomeResSchema
) {}

export class UpdateUserTestQuestionHomeBodyDTO extends createZodDto(
  UpdateUserTestQuestionHomeBodySchema
) {}

export class UpdateUserTestQuestionHomeResDTO extends createZodDto(
  UpdateUserTestQuestionHomeResSchema
) {}

export class GetUserTestQuestionHomeParamsDTO extends createZodDto(
  GetQuestionHomeParamsSchema
) {}

export class GetUserTestQuestionHomeResDTO extends createZodDto(
  GetUserTestQuestionHomeResSchema
) {}
