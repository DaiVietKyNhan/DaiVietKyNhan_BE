import { createZodDto } from 'nestjs-zod'
import {
    CreateLetterBodySchema,
    CreateLetterResSchema,
    GetLetterListResSchema,
    GetLetterParamsSchema,
    GetLetterResSchema,
    UpdateLetterBodySchema,
    UpdateLetterResSchema
} from '../entities/letter.entity'

export class CreateLetterBodyDTO extends createZodDto(CreateLetterBodySchema) { }

export class CreateLetterResDTO extends createZodDto(CreateLetterResSchema) { }

export class GetLetterResDTO extends createZodDto(GetLetterResSchema) { }

export class GetLetterListResDTO extends createZodDto(GetLetterListResSchema) { }

export class UpdateLetterBodyDTO extends createZodDto(UpdateLetterBodySchema) { }

export class UpdateLetterResDTO extends createZodDto(UpdateLetterResSchema) { }

export class GetLetterParamsDTO extends createZodDto(GetLetterParamsSchema) { }

