import { createZodDto } from 'nestjs-zod'
import {
  CreateUserAnswerLogBodySchema,
  CreateUserAnswerLogResSchema,
  GetUserAnswerLogByQuestionIdParamsSchema,
  GetUserAnswerLogParamsSchema,
  GetUserAnswerLogResSchema,
  PassUserAnswerLogBodySchema,
  UpdateUserAnswerLogBodySchema,
  UpdateUserAnswerLogResSchema
} from '../entities/user-answerlog.entity'

export class CreateUserAnswerLogBodyDTO extends createZodDto(
  CreateUserAnswerLogBodySchema
) {}
export class CreateUserAnswerLogResDTO extends createZodDto(
  CreateUserAnswerLogResSchema
) {}

export class PassUserAnswerLogBodyDTO extends createZodDto(PassUserAnswerLogBodySchema) {}

export class UpdateUserAnswerLogBodyDTO extends createZodDto(
  UpdateUserAnswerLogBodySchema
) {}
export class UpdateUserAnswerLogResDTO extends createZodDto(
  UpdateUserAnswerLogResSchema
) {}
export class GetParamsUserAnswerLogDTO extends createZodDto(
  GetUserAnswerLogParamsSchema
) {}

export class GetParamsUserAnswerLogByQuestionIdDTO extends createZodDto(
  GetUserAnswerLogByQuestionIdParamsSchema
) {}

export class GetUserAnswerLogResDTO extends createZodDto(GetUserAnswerLogResSchema) {}
