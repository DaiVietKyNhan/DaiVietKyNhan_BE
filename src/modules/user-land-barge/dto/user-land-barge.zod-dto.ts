import { createZodDto } from 'nestjs-zod'
import {
  CreateUserLandBargeBodySchema,
  CreateUserLandBargeListResSchema,
  CreateUserLandBargeResSchema,
  GetUserLandBargeParamsSchema,
  GetUserLandBargeResSchema,
  GetUserLandBargesResSchema,
  GetUserLandBargeWithLandIdParamsSchema,
  UpdateUserLandBargeBodySchema,
  UpdateUserLandBargeResSchema
} from '../entities/user-land-barge.entity'

export class CreateUserLandBargeBodyDTO extends createZodDto(
  CreateUserLandBargeBodySchema
) {}
export class CreateUserLandBargeResDTO extends createZodDto(
  CreateUserLandBargeResSchema
) {}
export class CreateUserLandBargeListResDTO extends createZodDto(
  CreateUserLandBargeListResSchema
) {}
export class UpdateUserLandBargeBodyDTO extends createZodDto(
  UpdateUserLandBargeBodySchema
) {}
export class UpdateUserLandBargeResDTO extends createZodDto(
  UpdateUserLandBargeResSchema
) {}
export class GetParamsUserLandBargeDTO extends createZodDto(
  GetUserLandBargeParamsSchema
) {}

export class GetUserLandBargeWithLandIdParamsDTO extends createZodDto(
  GetUserLandBargeWithLandIdParamsSchema
) {}

export class GetUserLandBargeResDTO extends createZodDto(GetUserLandBargeResSchema) {}

export class GetUserLandBargesResDTO extends createZodDto(GetUserLandBargesResSchema) {}
