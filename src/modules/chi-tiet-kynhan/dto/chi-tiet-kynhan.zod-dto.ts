import { createZodDto } from 'nestjs-zod'
import {
    CreateChiTietKyNhanBodySchema,
    CreateChiTietKyNhanCompleteBodySchema,
    CreateChiTietKyNhanCompleteResSchema,
    CreateChiTietKyNhanResSchema,
    CreateKyNhanCompleteBodySchema,
    CreateKyNhanCompleteResSchema,
    GetChiTietKyNhanByKyNhanParamsSchema,
    GetChiTietKyNhanListResSchema,
    GetChiTietKyNhanParamsSchema,
    GetChiTietKyNhanResSchema,
    UpdateChiTietKyNhanBodySchema,
    UpdateChiTietKyNhanCompleteBodySchema,
    UpdateChiTietKyNhanCompleteResSchema,
    UpdateChiTietKyNhanResSchema
} from '../entities/chi-tiet-kynhan.entities'

export class CreateChiTietKyNhanBodyDTO extends createZodDto(CreateChiTietKyNhanBodySchema) { }
export class CreateChiTietKyNhanResDTO extends createZodDto(CreateChiTietKyNhanResSchema) { }
export class CreateChiTietKyNhanCompleteBodyDTO extends createZodDto(CreateChiTietKyNhanCompleteBodySchema) { }
export class CreateChiTietKyNhanCompleteResDTO extends createZodDto(CreateChiTietKyNhanCompleteResSchema) { }
export class UpdateChiTietKyNhanCompleteBodyDTO extends createZodDto(UpdateChiTietKyNhanCompleteBodySchema) { }
export class UpdateChiTietKyNhanCompleteResDTO extends createZodDto(UpdateChiTietKyNhanCompleteResSchema) { }
export class CreateKyNhanCompleteBodyDTO extends createZodDto(CreateKyNhanCompleteBodySchema) { }
export class CreateKyNhanCompleteResDTO extends createZodDto(CreateKyNhanCompleteResSchema) { }
export class UpdateChiTietKyNhanBodyDTO extends createZodDto(UpdateChiTietKyNhanBodySchema) { }
export class UpdateChiTietKyNhanResDTO extends createZodDto(UpdateChiTietKyNhanResSchema) { }
export class GetChiTietKyNhanParamsDTO extends createZodDto(GetChiTietKyNhanParamsSchema) { }
export class GetChiTietKyNhanResDTO extends createZodDto(GetChiTietKyNhanResSchema) { }
export class GetChiTietKyNhanByKyNhanParamsDTO extends createZodDto(GetChiTietKyNhanByKyNhanParamsSchema) { }
export class GetChiTietKyNhanListResDTO extends createZodDto(GetChiTietKyNhanListResSchema) { }
