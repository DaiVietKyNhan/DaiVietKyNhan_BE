import {
  CreateMediaBodySchema,
  UpdateMediaBodySchema,
  QueryMediaSchema,
  MediaResSchema,
  MediaListResSchema
} from '../entities/media.entities'
import { createZodDto } from 'nestjs-zod'

export class CreateMediaBodyDTO extends createZodDto(CreateMediaBodySchema) {}

export class UpdateMediaBodyDTO extends createZodDto(UpdateMediaBodySchema) {}

export class QueryMediaDTO extends createZodDto(QueryMediaSchema) {}

export class MediaResDTO extends createZodDto(MediaResSchema) {}

export class MediaListResDTO extends createZodDto(MediaListResSchema) {}
