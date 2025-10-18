import { checkIdSchema } from '@/common/utils/id.validation'
import { ENTITY_MESSAGE } from '@/common/constants/message'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const ChiTietKyNhanSuSachVietGiSchema = z
    .object({
        id: z.number(),
        chiTietKyNhanId: z.number(),
        tieuDe: z.string().min(1).max(500),
        doanVan: z.string().min(1), // Trích dẫn từ sử sách
        tacGia: z.string().max(500).nullable(), // Tác giả của đoạn văn
        nguonSach: z.string().nullable(), // Nguồn sách
        thuTu: z.number().default(0),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .strict()

export const CreateChiTietKyNhanSuSachVietGiBodySchema = ChiTietKyNhanSuSachVietGiSchema.pick({
    chiTietKyNhanId: true,
    tieuDe: true,
    doanVan: true,
    tacGia: true,
    nguonSach: true,
    thuTu: true
}).strict()

export const CreateChiTietKyNhanSuSachVietGiResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanSuSachVietGiSchema,
    message: z.string()
})

export const UpdateChiTietKyNhanSuSachVietGiBodySchema = CreateChiTietKyNhanSuSachVietGiBodySchema.partial().strict()

export const UpdateChiTietKyNhanSuSachVietGiResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanSuSachVietGiSchema,
    message: z.string()
})

export const GetChiTietKyNhanSuSachVietGiParamsSchema = z
    .object({
        suSachVietGiId: checkIdSchema('Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanSuSachVietGiResSchema = z
    .object({
        statusCode: z.number(),
        data: ChiTietKyNhanSuSachVietGiSchema,
        message: z.string()
    })
    .strict()

export const GetChiTietKyNhanSuSachVietGiByChiTietParamsSchema = z
    .object({
        chiTietKyNhanId: checkIdSchema('ChiTietKyNhan Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanSuSachVietGiListResSchema = z.object({
    statusCode: z.number(),
    data: z.array(ChiTietKyNhanSuSachVietGiSchema),
    message: z.string()
})

// Types
export type ChiTietKyNhanSuSachVietGiType = z.infer<typeof ChiTietKyNhanSuSachVietGiSchema>
export type CreateChiTietKyNhanSuSachVietGiBodyType = z.infer<typeof CreateChiTietKyNhanSuSachVietGiBodySchema>
export type UpdateChiTietKyNhanSuSachVietGiBodyType = z.infer<typeof UpdateChiTietKyNhanSuSachVietGiBodySchema>
export type GetChiTietKyNhanSuSachVietGiParamsType = z.infer<typeof GetChiTietKyNhanSuSachVietGiParamsSchema>
export type GetChiTietKyNhanSuSachVietGiResType = z.infer<typeof GetChiTietKyNhanSuSachVietGiResSchema>
export type GetChiTietKyNhanSuSachVietGiByChiTietParamsType = z.infer<typeof GetChiTietKyNhanSuSachVietGiByChiTietParamsSchema>

// Fields for query parsing
type ChiTietKyNhanSuSachVietGiFieldType = keyof z.infer<typeof ChiTietKyNhanSuSachVietGiSchema>
export const CHI_TIET_KY_NHAN_SU_SACH_VIET_GI_FIELDS = Object.keys(ChiTietKyNhanSuSachVietGiSchema.shape) as ChiTietKyNhanSuSachVietGiFieldType[]
