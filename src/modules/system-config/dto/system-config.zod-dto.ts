import { createZodDto } from 'nestjs-zod'
import {
  CreateSystemConfigBodySchema,
  CreateSystemConfigResSchema,
  GetParamsByDateSystemConfigSchema,
  GetParamsSystemConfigSchema,
  GetSystemConfigResSchema
} from '../entities/system-config.entity'

export class CreateSystemConfigDTO extends createZodDto(CreateSystemConfigBodySchema) {}
export class CreateSystemConfigResDTO extends createZodDto(CreateSystemConfigResSchema) {}
export class UpdateSystemConfigDTO extends createZodDto(CreateSystemConfigBodySchema) {}
export class UpdateSystemConfigResDTO extends createZodDto(CreateSystemConfigResSchema) {}
export class GetParamsSystemConfigDTO extends createZodDto(GetParamsSystemConfigSchema) {}
export class GetParamsByDateSystemConfigDTO extends createZodDto(
  GetParamsByDateSystemConfigSchema
) {}

export class GetSystemConfigDTO extends createZodDto(GetSystemConfigResSchema) {}
