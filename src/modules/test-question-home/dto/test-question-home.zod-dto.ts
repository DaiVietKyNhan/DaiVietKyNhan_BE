import { createZodDto } from 'nestjs-zod'
import {
  CreateTestQuestionHomeBodySchema,
  CreateTestQuestionHomeResSchema,
  GetQuestionHomeParamsSchema,
  GetTestQuestionHomeResSchema,
  UpdateTestQuestionHomeBodySchema,
  UpdateTestQuestionHomeResSchema
} from '../entities/test-question-home.entity'

export class CreateTestQuestionHomeBodyDTO extends createZodDto(
  CreateTestQuestionHomeBodySchema
) {}

export class CreateTestQuestionHomeResDTO extends createZodDto(
  CreateTestQuestionHomeResSchema
) {}

export class UpdateTestQuestionHomeBodyDTO extends createZodDto(
  UpdateTestQuestionHomeBodySchema
) {}

export class UpdateTestQuestionHomeResDTO extends createZodDto(
  UpdateTestQuestionHomeResSchema
) {}

export class GetTestQuestionHomeParamsDTO extends createZodDto(
  GetQuestionHomeParamsSchema
) {}

export class GetTestQuestionHomeResDTO extends createZodDto(
  GetTestQuestionHomeResSchema
) {}
