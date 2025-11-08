import { createZodDto } from 'nestjs-zod'
import {
    CreateLetterBodySchema,
    CreateLetterResSchema,
    GetLetterListResSchema,
    GetLetterParamsSchema,
    GetLetterResSchema,
    UpdateLetterBodySchema,
    UpdateLetterResSchema,
    UpdateLetterFullBodySchema,
    BulkUpdateLetterBodySchema,
    BulkUpdateLetterResSchema,
    ListLetterQuerySchema
} from '../entities/letter.entity'

export class CreateLetterBodyDTO extends createZodDto(CreateLetterBodySchema) { }

export class CreateLetterResDTO extends createZodDto(CreateLetterResSchema) { }

export class GetLetterResDTO extends createZodDto(GetLetterResSchema) { }

export class GetLetterListResDTO extends createZodDto(GetLetterListResSchema) { }

export class UpdateLetterBodyDTO extends createZodDto(UpdateLetterBodySchema) { }

export class UpdateLetterFullBodyDTO extends createZodDto(UpdateLetterFullBodySchema) { }

export class UpdateLetterResDTO extends createZodDto(UpdateLetterResSchema) { }

export class BulkUpdateLetterBodyDTO extends createZodDto(BulkUpdateLetterBodySchema) { }

export class BulkUpdateLetterResDTO extends createZodDto(BulkUpdateLetterResSchema) { }

export class GetLetterParamsDTO extends createZodDto(GetLetterParamsSchema) { }

export class ListLetterQueryDTO extends createZodDto(ListLetterQuerySchema) { }

