import { createZodDto } from 'nestjs-zod'
import {
  CreateChangePointUserLogBodySchema,
  CreateChangePointUserLogResSchema,
  GetChangePointUserLogParamsSchema,
  GetChangePointUserLogResSchema,
  UpdateChangePointUserLogBodySchema,
  UpdateChangePointUserLogResSchema
} from '../entities/change-point-user-log.entity'

export class CreateChangePointUserLogBodyDTO extends createZodDto(
  CreateChangePointUserLogBodySchema
) {}
export class CreateChangePointUserLogResDTO extends createZodDto(
  CreateChangePointUserLogResSchema
) {}
export class UpdateChangePointUserLogBodyDTO extends createZodDto(
  UpdateChangePointUserLogBodySchema
) {}
export class UpdateChangePointUserLogResDTO extends createZodDto(
  UpdateChangePointUserLogResSchema
) {}
export class GetParamsChangePointUserLogDTO extends createZodDto(
  GetChangePointUserLogParamsSchema
) {}
export class GetChangePointUserLogResDTO extends createZodDto(
  GetChangePointUserLogResSchema
) {}
