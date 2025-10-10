import { createZodDto } from 'nestjs-zod'
import {
  CreateSystemConfigBodySchema,
  CreateSystemConfigResSchema,
  GetParamsByActiveSystemConfigSchema,
  GetParamsSystemConfigSchema,
  GetSystemConfigResSchema,
  GetSystemConfigWithAmountUserResSchema
} from '../entities/system-config.entity'

export class CreateSystemConfigDTO extends createZodDto(CreateSystemConfigBodySchema) {}
export class CreateSystemConfigResDTO extends createZodDto(CreateSystemConfigResSchema) {}
export class UpdateSystemConfigDTO extends createZodDto(CreateSystemConfigBodySchema) {}
export class UpdateSystemConfigResDTO extends createZodDto(CreateSystemConfigResSchema) {}
export class GetParamsSystemConfigDTO extends createZodDto(GetParamsSystemConfigSchema) {}
export class GetParamsByActiveSystemConfigDTO extends createZodDto(
  GetParamsByActiveSystemConfigSchema
) {}

export class GetSystemConfigDTO extends createZodDto(GetSystemConfigResSchema) {}

export class GetSystemConfigWithAmountUserDTO extends createZodDto(
  GetSystemConfigWithAmountUserResSchema
) {}
