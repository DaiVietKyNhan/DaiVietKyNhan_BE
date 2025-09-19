import {
    CreateChiTietKyNhanBodySchema,
    UpdateChiTietKyNhanBodySchema,
    QueryChiTietKyNhanSchema,
    ChiTietKyNhanResSchema,
    ChiTietKyNhanListResSchema
} from '../entities/chitietkynhan.entities'
import { createZodDto } from 'nestjs-zod'

export class CreateChiTietKyNhanBodyDTO extends createZodDto(CreateChiTietKyNhanBodySchema) { }

export class UpdateChiTietKyNhanBodyDTO extends createZodDto(UpdateChiTietKyNhanBodySchema) { }

export class QueryChiTietKyNhanDTO extends createZodDto(QueryChiTietKyNhanSchema) { }

export class ChiTietKyNhanResDTO extends createZodDto(ChiTietKyNhanResSchema) { }

export class ChiTietKyNhanListResDTO extends createZodDto(ChiTietKyNhanListResSchema) { }
