import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const MotaKyNhanSchema = z
  .object({
    id: z.number(),
    ten: z.string().min(1).max(500),
    danhHieu: z.string().max(500).nullable(),
    namSinhNamMat: z.string().max(500).nullable(),
    queQuan: z.string().max(500).nullable(),
    xuatThan: z.string().max(500).nullable(),
    khoiNghia: z.string().max(500).nullable(),
    nguoiDongHanh: z.string().max(500).nullable(),
    phuQuan: z.string().max(500).nullable(),
    chienCong: z.string().max(500).nullable(),
    dinhCao: z.string().max(500).nullable(),
    ketCuc: z.string().max(500).nullable(),
    imgUrl: z.string().nullable(),

    kyNhanId: z.number(),

    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateMotaKyNhanBodySchema = MotaKyNhanSchema.pick({
  ten: true,
  danhHieu: true,
  namSinhNamMat: true,
  queQuan: true,
  xuatThan: true,
  khoiNghia: true,
  nguoiDongHanh: true,
  phuQuan: true,
  chienCong: true,
  dinhCao: true,
  ketCuc: true,
  imgUrl: true,
  kyNhanId: true
}).strict()

export const CreateMotaKyNhanResSchema = z.object({
  statusCode: z.number(),
  data: MotaKyNhanSchema,
  message: z.string()
})

export const UpdateMotaKyNhanBodySchema = CreateMotaKyNhanBodySchema.partial().strict()

export const UpdateMotaKyNhanResSchema = z.object({
  statusCode: z.number(),
  data: MotaKyNhanSchema,
  message: z.string()
})

export const GetMotaKyNhanParamsSchema = z
  .object({
    moTaKyNhanId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetMotaKyNhanIdParamsSchema = z
  .object({
    kyNhanId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetMotaKyNhanResSchema = z
  .object({
    statusCode: z.number(),
    data: MotaKyNhanSchema,
    message: z.string()
  })
  .strict()

// Types
export type MotaKyNhanType = z.infer<typeof MotaKyNhanSchema>
export type CreateMotaKyNhanBodyType = z.infer<typeof CreateMotaKyNhanBodySchema>
export type UpdateMotaKyNhanBodyType = z.infer<typeof UpdateMotaKyNhanBodySchema>
export type GetMotaKyNhanParamsType = z.infer<typeof GetMotaKyNhanParamsSchema>
export type GetMotaKyNhanResType = z.infer<typeof GetMotaKyNhanResSchema>

//field
type MotaKyNhanFieldType = keyof z.infer<typeof MotaKyNhanSchema>
export const MOTAKYNHAN_FIELDS = Object.keys(
  MotaKyNhanSchema.shape
) as MotaKyNhanFieldType[]
