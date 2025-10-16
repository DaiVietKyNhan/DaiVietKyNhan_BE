import { createZodDto } from 'nestjs-zod'
import {
  CreateMotaKyNhanBodySchema,
  CreateMotaKyNhanResSchema,
  GetMotaKyNhanIdParamsSchema,
  GetMotaKyNhanParamsSchema,
  GetMotaKyNhanResSchema,
  UpdateMotaKyNhanBodySchema,
  UpdateMotaKyNhanResSchema
} from '../entities/mo-ta-ky-nhan.entity'

export class CreateMotaKyNhanBodyDTO extends createZodDto(CreateMotaKyNhanBodySchema) {}
export class CreateMotaKyNhanResDTO extends createZodDto(CreateMotaKyNhanResSchema) {}
export class UpdateMotaKyNhanBodyDTO extends createZodDto(UpdateMotaKyNhanBodySchema) {}
export class UpdateMotaKyNhanResDTO extends createZodDto(UpdateMotaKyNhanResSchema) {}
export class GetParamsMotaKyNhanDTO extends createZodDto(GetMotaKyNhanParamsSchema) {}
export class GetParamsMotaKyNhanIdDTO extends createZodDto(GetMotaKyNhanIdParamsSchema) {}
export class GetMotaKyNhanResDTO extends createZodDto(GetMotaKyNhanResSchema) {}
