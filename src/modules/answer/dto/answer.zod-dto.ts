import { createZodDto } from 'nestjs-zod'
import {
  CreateAnswerBodySchema,
  CreateAnswerResSchema,
  GetAnswerParamsSchema,
  GetAnswerResSchema,
  UpdateAnswerBodySchema,
  UpdateAnswerResSchema
} from '../entities/answer.entity'

export class CreateAnswerBodyDTO extends createZodDto(CreateAnswerBodySchema) {}
export class CreateAnswerResDTO extends createZodDto(CreateAnswerResSchema) {}
export class UpdateAnswerBodyDTO extends createZodDto(UpdateAnswerBodySchema) {}
export class UpdateAnswerResDTO extends createZodDto(UpdateAnswerResSchema) {}
export class GetParamsAnswerDTO extends createZodDto(GetAnswerParamsSchema) {}
export class GetAnswerResDTO extends createZodDto(GetAnswerResSchema) {}
