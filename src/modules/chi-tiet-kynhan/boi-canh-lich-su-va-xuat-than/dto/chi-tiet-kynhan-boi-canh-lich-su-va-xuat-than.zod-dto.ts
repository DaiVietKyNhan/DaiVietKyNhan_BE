import { createZodDto } from 'nestjs-zod'
import {
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema,
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema,
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietParamsSchema,
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanListResSchema,
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanParamsSchema,
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema,
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema,
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema
} from '../entities/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.entities'

export class CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyDTO extends createZodDto(
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema
) {}
export class CreateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO extends createZodDto(
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema
) {}
export class UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyDTO extends createZodDto(
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema
) {}
export class UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO extends createZodDto(
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema
) {}
export class GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanDTO extends createZodDto(
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanParamsSchema
) {}
export class GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietDTO extends createZodDto(
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietParamsSchema
) {}
export class GetChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO extends createZodDto(
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema
) {}
export class GetChiTietKyNhanBoiCanhLichSuVaSuuThanListResDTO extends createZodDto(
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanListResSchema
) {}
