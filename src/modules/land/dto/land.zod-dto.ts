import { createZodDto } from 'nestjs-zod'
import {
  CreateLandBodySchema,
  CreateLandResSchema,
  GetLandParamsSchema,
  GetLandResSchema,
  UpdateLandBodySchema,
  UpdateLandResSchema
} from '../entities/land.entity'

export class CreateLandBodyDTO extends createZodDto(CreateLandBodySchema) {}
export class CreateLandResDTO extends createZodDto(CreateLandResSchema) {}
export class UpdateLandBodyDTO extends createZodDto(UpdateLandBodySchema) {}
export class UpdateLandResDTO extends createZodDto(UpdateLandResSchema) {}
export class GetParamsLandDTO extends createZodDto(GetLandParamsSchema) {}
export class GetLandResDTO extends createZodDto(GetLandResSchema) {}
