import { createZodDto } from 'nestjs-zod'
import {
  CreateUserBodySchema,
  CreateUserResSchema,
  GetParamsIdOrEmailSchema,
  GetParamsUserSchema,
  GetUserWithRoleResSchema,
  UpdateUserBodySchema,
  UpdateUserResSchema
} from '../entities/user.entity'

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}

export class CreateUserResDTO extends createZodDto(CreateUserResSchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}

export class UpdateUserResDTO extends createZodDto(UpdateUserResSchema) {}

export class GetParamsUserDTO extends createZodDto(GetParamsUserSchema) {}

export class GetParamsIdOrEmailDTO extends createZodDto(GetParamsIdOrEmailSchema) {}

export class GetUserWithRoleResDTO extends createZodDto(GetUserWithRoleResSchema) {}
