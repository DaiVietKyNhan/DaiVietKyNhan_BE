import { createZodDto } from 'nestjs-zod'
import {
  CreateLandBargeBodySchema,
  CreateLandBargeResSchema,
  GetLandBargeResSchema,
  GetLandBargesByUserResSchema,
  GetQuestionHomeParamsSchema,
  UpdateLandBargeBodySchema,
  UpdateLandBargeResSchema
} from '../entities/land-barge.entity'

export class CreateLandBargeBodyDTO extends createZodDto(CreateLandBargeBodySchema) {}

export class CreateLandBargeResDTO extends createZodDto(CreateLandBargeResSchema) {}

export class UpdateLandBargeBodyDTO extends createZodDto(UpdateLandBargeBodySchema) {}

export class UpdateLandBargeResDTO extends createZodDto(UpdateLandBargeResSchema) {}

export class GetLandBargeParamsDTO extends createZodDto(GetQuestionHomeParamsSchema) {}

export class GetLandBargeResDTO extends createZodDto(GetLandBargeResSchema) {}

export class GetLandBargesByUserResDTO extends createZodDto(
  GetLandBargesByUserResSchema
) {}
