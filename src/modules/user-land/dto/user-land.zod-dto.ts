import { createZodDto } from 'nestjs-zod'
import {
  CreateUserLandBodySchema,
  CreateUserLandListResSchema,
  CreateUserLandResSchema,
  GetUserLandParamsSchema,
  GetUserLandResSchema,
  UpdateUserLandBodySchema,
  UpdateUserLandResSchema
} from '../entities/user-land.entity'

export class CreateUserLandBodyDTO extends createZodDto(CreateUserLandBodySchema) {}
export class CreateUserLandResDTO extends createZodDto(CreateUserLandResSchema) {}
export class CreateUserLandListResDTO extends createZodDto(CreateUserLandListResSchema) {}
export class UpdateUserLandBodyDTO extends createZodDto(UpdateUserLandBodySchema) {}
export class UpdateUserLandResDTO extends createZodDto(UpdateUserLandResSchema) {}
export class GetParamsUserLandDTO extends createZodDto(GetUserLandParamsSchema) {}
export class GetUserLandResDTO extends createZodDto(GetUserLandResSchema) {}
