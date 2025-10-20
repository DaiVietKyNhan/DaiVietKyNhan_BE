import { createZodDto } from 'nestjs-zod'
import {
  CreateKyNhanBodySchema,
  CreateKyNhanResSchema,
  GetKyNhanParamsSchema,
  GetKyNhanResSchema,
  GetKyNhansUserResSchema,
  UpdateKyNhanBodySchema,
  UpdateKyNhanResSchema
} from '../entities/kynhan.entities'

export class CreateKyNhanBodyDTO extends createZodDto(CreateKyNhanBodySchema) {}
export class CreateKyNhanResDTO extends createZodDto(CreateKyNhanResSchema) {}
export class UpdateKyNhanBodyDTO extends createZodDto(UpdateKyNhanBodySchema) {}
export class UpdateKyNhanResDTO extends createZodDto(UpdateKyNhanResSchema) {}
export class GetParamsKyNhanDTO extends createZodDto(GetKyNhanParamsSchema) {}
export class GetKyNhanResDTO extends createZodDto(GetKyNhanResSchema) {}
export class GetKyNhanUserResDTO extends createZodDto(GetKyNhanResSchema) {}
export class GetKyNhansUserResDTO extends createZodDto(GetKyNhansUserResSchema) {}
