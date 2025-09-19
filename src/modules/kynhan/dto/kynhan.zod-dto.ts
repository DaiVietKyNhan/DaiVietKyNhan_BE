import {
    CreateKyNhanBodySchema,
    UpdateKyNhanBodySchema,
    QueryKyNhanSchema,
    KyNhanResSchema,
    KyNhanListResSchema
} from '../entities/kynhan.entities'
import { createZodDto } from 'nestjs-zod'

export class CreateKyNhanBodyDTO extends createZodDto(CreateKyNhanBodySchema) { }

export class UpdateKyNhanBodyDTO extends createZodDto(UpdateKyNhanBodySchema) { }

export class QueryKyNhanDTO extends createZodDto(QueryKyNhanSchema) { }

export class KyNhanResDTO extends createZodDto(KyNhanResSchema) { }

export class KyNhanListResDTO extends createZodDto(KyNhanListResSchema) { }
