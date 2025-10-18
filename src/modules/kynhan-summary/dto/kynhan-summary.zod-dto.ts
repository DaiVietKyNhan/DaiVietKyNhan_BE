import { createZodDto } from 'nestjs-zod'
import {
  CreateKyNhanSummaryBodySchema,
  CreateKyNhanSummaryResSchema,
  GetKyNhanByLandIdSummaryParamsSchema,
  GetKyNhanByQuesIdSummaryParamsSchema,
  GetKyNhanSummariesResSchema,
  GetKyNhanSummaryParamsSchema,
  GetKyNhanSummaryResSchema,
  GetKyNhanSummarysByUserResSchema,
  UpdateKyNhanSummaryBodySchema,
  UpdateKyNhanSummaryResSchema
} from '../entities/kynhan-summary.entity'

export class CreateKyNhanSummaryBodyDTO extends createZodDto(
  CreateKyNhanSummaryBodySchema
) {}

export class CreateKyNhanSummaryResDTO extends createZodDto(
  CreateKyNhanSummaryResSchema
) {}

export class UpdateKyNhanSummaryBodyDTO extends createZodDto(
  UpdateKyNhanSummaryBodySchema
) {}

export class UpdateKyNhanSummaryResDTO extends createZodDto(
  UpdateKyNhanSummaryResSchema
) {}

export class GetKyNhanSummaryParamsDTO extends createZodDto(
  GetKyNhanSummaryParamsSchema
) {}

export class GetKyNhanSummaryByQuesIdParamsDTO extends createZodDto(
  GetKyNhanByQuesIdSummaryParamsSchema
) {}

export class GetKyNhanByLandIdSummaryParamsDTO extends createZodDto(
  GetKyNhanByLandIdSummaryParamsSchema
) {}

export class GetKyNhanSummaryResDTO extends createZodDto(GetKyNhanSummaryResSchema) {}
export class GetKyNhanSummariesResDTO extends createZodDto(GetKyNhanSummariesResSchema) {}

export class GetKyNhanSummarysByUserResDTO extends createZodDto(
  GetKyNhanSummarysByUserResSchema
) {}
