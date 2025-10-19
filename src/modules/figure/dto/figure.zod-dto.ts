import { createZodDto } from 'nestjs-zod'
import {
  CreateFigureBodySchema,
  CreateFigureResSchema,
  GetFigureParamsSchema,
  GetFigureResSchema,
  UpdateFigureBodySchema,
  UpdateFigureResSchema
} from '../entities/figure.entity'

export class CreateFigureBodyDTO extends createZodDto(CreateFigureBodySchema) {}

export class CreateFigureResDTO extends createZodDto(CreateFigureResSchema) {}

export class UpdateFigureBodyDTO extends createZodDto(UpdateFigureBodySchema) {}

export class UpdateFigureResDTO extends createZodDto(UpdateFigureResSchema) {}

export class GetFigureParamsDTO extends createZodDto(GetFigureParamsSchema) {}

export class GetFigureResDTO extends createZodDto(GetFigureResSchema) {}
