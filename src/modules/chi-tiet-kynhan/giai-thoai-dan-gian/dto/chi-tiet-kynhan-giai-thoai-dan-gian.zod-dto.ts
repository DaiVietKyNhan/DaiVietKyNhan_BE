import { createZodDto } from 'nestjs-zod'
import {
    CreateChiTietKyNhanGiaiThoaiDanGianBodySchema,
    CreateChiTietKyNhanGiaiThoaiDanGianResSchema,
    GetChiTietKyNhanGiaiThoaiDanGianByChiTietParamsSchema,
    GetChiTietKyNhanGiaiThoaiDanGianListResSchema,
    GetChiTietKyNhanGiaiThoaiDanGianParamsSchema,
    GetChiTietKyNhanGiaiThoaiDanGianResSchema,
    UpdateChiTietKyNhanGiaiThoaiDanGianBodySchema,
    UpdateChiTietKyNhanGiaiThoaiDanGianResSchema
} from '../entities/chi-tiet-kynhan-giai-thoai-dan-gian.entities'

export class CreateChiTietKyNhanGiaiThoaiDanGianBodyDTO extends createZodDto(
    CreateChiTietKyNhanGiaiThoaiDanGianBodySchema
) { }
export class CreateChiTietKyNhanGiaiThoaiDanGianResDTO extends createZodDto(
    CreateChiTietKyNhanGiaiThoaiDanGianResSchema
) { }
export class UpdateChiTietKyNhanGiaiThoaiDanGianBodyDTO extends createZodDto(
    UpdateChiTietKyNhanGiaiThoaiDanGianBodySchema
) { }
export class UpdateChiTietKyNhanGiaiThoaiDanGianResDTO extends createZodDto(
    UpdateChiTietKyNhanGiaiThoaiDanGianResSchema
) { }
export class GetParamsChiTietKyNhanGiaiThoaiDanGianDTO extends createZodDto(
    GetChiTietKyNhanGiaiThoaiDanGianParamsSchema
) { }
export class GetParamsChiTietKyNhanGiaiThoaiDanGianByChiTietDTO extends createZodDto(
    GetChiTietKyNhanGiaiThoaiDanGianByChiTietParamsSchema
) { }
export class GetChiTietKyNhanGiaiThoaiDanGianResDTO extends createZodDto(
    GetChiTietKyNhanGiaiThoaiDanGianResSchema
) { }
export class GetChiTietKyNhanGiaiThoaiDanGianListResDTO extends createZodDto(
    GetChiTietKyNhanGiaiThoaiDanGianListResSchema
) { }
