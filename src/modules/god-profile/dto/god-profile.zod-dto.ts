import { createZodDto } from 'nestjs-zod'
import {
  CreateGodProfileBodySchema,
  CreateGodProfileResSchema,
  GetGodProfileResSchema,
  GetGodProfilesByUserResSchema,
  GetQuestionHomeParamsSchema,
  UpdateGodProfileBodySchema,
  UpdateGodProfileResSchema
} from '../entities/god-profile.entity'

export class CreateGodProfileBodyDTO extends createZodDto(CreateGodProfileBodySchema) {}

export class CreateGodProfileResDTO extends createZodDto(CreateGodProfileResSchema) {}

export class UpdateGodProfileBodyDTO extends createZodDto(UpdateGodProfileBodySchema) {}

export class UpdateGodProfileResDTO extends createZodDto(UpdateGodProfileResSchema) {}

export class GetGodProfileParamsDTO extends createZodDto(GetQuestionHomeParamsSchema) {}

export class GetGodProfileResDTO extends createZodDto(GetGodProfileResSchema) {}

export class GetGodProfilesByUserResDTO extends createZodDto(
  GetGodProfilesByUserResSchema
) {}
