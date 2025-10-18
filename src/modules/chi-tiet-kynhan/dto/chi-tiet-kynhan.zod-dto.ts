import { createZodDto } from 'nestjs-zod'
import {
    CreateChiTietKyNhanBodySchema,
    CreateChiTietKyNhanResSchema,
    CreateKyNhanCompleteBodySchema,
    CreateKyNhanCompleteResSchema,
    GetChiTietKyNhanByKyNhanParamsSchema,
    GetChiTietKyNhanListResSchema,
    GetChiTietKyNhanParamsSchema,
    GetChiTietKyNhanResSchema,
    UpdateChiTietKyNhanBodySchema,
    UpdateChiTietKyNhanResSchema
} from '../entities/chi-tiet-kynhan.entities'

export class CreateChiTietKyNhanBodyDTO extends createZodDto(CreateChiTietKyNhanBodySchema) { }
export class CreateChiTietKyNhanResDTO extends createZodDto(CreateChiTietKyNhanResSchema) { }
export class CreateKyNhanCompleteBodyDTO extends createZodDto(CreateKyNhanCompleteBodySchema) { }
export class CreateKyNhanCompleteResDTO extends createZodDto(CreateKyNhanCompleteResSchema) { }
export class UpdateChiTietKyNhanBodyDTO extends createZodDto(UpdateChiTietKyNhanBodySchema) { }
export class UpdateChiTietKyNhanResDTO extends createZodDto(UpdateChiTietKyNhanResSchema) { }
export class GetChiTietKyNhanParamsDTO extends createZodDto(GetChiTietKyNhanParamsSchema) { }
export class GetChiTietKyNhanResDTO extends createZodDto(GetChiTietKyNhanResSchema) { }
export class GetChiTietKyNhanByKyNhanParamsDTO extends createZodDto(GetChiTietKyNhanByKyNhanParamsSchema) { }
export class GetChiTietKyNhanListResDTO extends createZodDto(GetChiTietKyNhanListResSchema) { }
