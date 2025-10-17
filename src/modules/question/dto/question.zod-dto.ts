import { createZodDto } from 'nestjs-zod'
import {
  CreateQuestionBodySchema,
  CreateQuestionResSchema,
  GetQuestionParamsSchema,
  GetQuestionResSchema,
  UpdateQuestionBodySchema,
  UpdateQuestionResSchema
} from '../entities/question.entity'

export class CreateQuestionBodyDTO extends createZodDto(CreateQuestionBodySchema) {}
export class CreateQuestionResDTO extends createZodDto(CreateQuestionResSchema) {}
export class UpdateQuestionBodyDTO extends createZodDto(UpdateQuestionBodySchema) {}
export class UpdateQuestionResDTO extends createZodDto(UpdateQuestionResSchema) {}
export class GetParamsQuestionDTO extends createZodDto(GetQuestionParamsSchema) {}
export class GetQuestionResDTO extends createZodDto(GetQuestionResSchema) {}
