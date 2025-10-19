import { createZodDto } from 'nestjs-zod'
import {
    CreateChiTietKyNhanSuSachVietGiBodySchema,
    CreateChiTietKyNhanSuSachVietGiResSchema,
    GetChiTietKyNhanSuSachVietGiByChiTietParamsSchema,
    GetChiTietKyNhanSuSachVietGiListResSchema,
    GetChiTietKyNhanSuSachVietGiParamsSchema,
    GetChiTietKyNhanSuSachVietGiResSchema,
    UpdateChiTietKyNhanSuSachVietGiBodySchema,
    UpdateChiTietKyNhanSuSachVietGiResSchema
} from '../entities/chi-tiet-kynhan-su-sach-viet-gi.entities'

export class CreateChiTietKyNhanSuSachVietGiBodyDTO extends createZodDto(
    CreateChiTietKyNhanSuSachVietGiBodySchema
) { }
export class CreateChiTietKyNhanSuSachVietGiResDTO extends createZodDto(
    CreateChiTietKyNhanSuSachVietGiResSchema
) { }
export class UpdateChiTietKyNhanSuSachVietGiBodyDTO extends createZodDto(
    UpdateChiTietKyNhanSuSachVietGiBodySchema
) { }
export class UpdateChiTietKyNhanSuSachVietGiResDTO extends createZodDto(
    UpdateChiTietKyNhanSuSachVietGiResSchema
) { }
export class GetParamsChiTietKyNhanSuSachVietGiDTO extends createZodDto(
    GetChiTietKyNhanSuSachVietGiParamsSchema
) { }
export class GetParamsChiTietKyNhanSuSachVietGiByChiTietDTO extends createZodDto(
    GetChiTietKyNhanSuSachVietGiByChiTietParamsSchema
) { }
export class GetChiTietKyNhanSuSachVietGiResDTO extends createZodDto(
    GetChiTietKyNhanSuSachVietGiResSchema
) { }
export class GetChiTietKyNhanSuSachVietGiListResDTO extends createZodDto(
    GetChiTietKyNhanSuSachVietGiListResSchema
) { }
