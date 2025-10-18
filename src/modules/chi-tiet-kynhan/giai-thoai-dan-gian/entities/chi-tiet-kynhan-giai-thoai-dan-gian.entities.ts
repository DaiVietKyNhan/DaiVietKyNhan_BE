import { checkIdSchema } from '@/common/utils/id.validation'
import { ENTITY_MESSAGE } from '@/common/constants/message'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const ChiTietKyNhanGiaiThoaiDanGianSchema = z
    .object({
        id: z.number(),
        chiTietKyNhanId: z.number(),
        tieuDe: z.string().min(1).max(500),
        noiDung: z.string().min(1),
        nguon: z.string().nullable(),
        thuTu: z.number().default(0),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .strict()

export const CreateChiTietKyNhanGiaiThoaiDanGianBodySchema = ChiTietKyNhanGiaiThoaiDanGianSchema.pick({
    chiTietKyNhanId: true,
    tieuDe: true,
    noiDung: true,
    nguon: true,
    thuTu: true
}).extend({
    thuTu: z.number().optional()
}).strict()

export const CreateChiTietKyNhanGiaiThoaiDanGianResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanGiaiThoaiDanGianSchema,
    message: z.string()
})

export const UpdateChiTietKyNhanGiaiThoaiDanGianBodySchema = CreateChiTietKyNhanGiaiThoaiDanGianBodySchema.partial().strict()

export const UpdateChiTietKyNhanGiaiThoaiDanGianResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanGiaiThoaiDanGianSchema,
    message: z.string()
})

export const GetChiTietKyNhanGiaiThoaiDanGianParamsSchema = z
    .object({
        giaiThoaiDanGianId: checkIdSchema('Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanGiaiThoaiDanGianResSchema = z
    .object({
        statusCode: z.number(),
        data: ChiTietKyNhanGiaiThoaiDanGianSchema,
        message: z.string()
    })
    .strict()

export const GetChiTietKyNhanGiaiThoaiDanGianByChiTietParamsSchema = z
    .object({
        chiTietKyNhanId: checkIdSchema('ChiTietKyNhan Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanGiaiThoaiDanGianListResSchema = z.object({
    statusCode: z.number(),
    data: z.array(ChiTietKyNhanGiaiThoaiDanGianSchema),
    message: z.string()
})

// Types
export type ChiTietKyNhanGiaiThoaiDanGianType = z.infer<typeof ChiTietKyNhanGiaiThoaiDanGianSchema>
export type CreateChiTietKyNhanGiaiThoaiDanGianBodyType = z.infer<typeof CreateChiTietKyNhanGiaiThoaiDanGianBodySchema>
export type UpdateChiTietKyNhanGiaiThoaiDanGianBodyType = z.infer<typeof UpdateChiTietKyNhanGiaiThoaiDanGianBodySchema>
export type GetChiTietKyNhanGiaiThoaiDanGianParamsType = z.infer<typeof GetChiTietKyNhanGiaiThoaiDanGianParamsSchema>
export type GetChiTietKyNhanGiaiThoaiDanGianResType = z.infer<typeof GetChiTietKyNhanGiaiThoaiDanGianResSchema>
export type GetChiTietKyNhanGiaiThoaiDanGianByChiTietParamsType = z.infer<typeof GetChiTietKyNhanGiaiThoaiDanGianByChiTietParamsSchema>

// Fields for query parsing
type ChiTietKyNhanGiaiThoaiDanGianFieldType = keyof z.infer<typeof ChiTietKyNhanGiaiThoaiDanGianSchema>
export const CHI_TIET_KY_NHAN_GIAI_THOAI_DAN_GIAN_FIELDS = Object.keys(ChiTietKyNhanGiaiThoaiDanGianSchema.shape) as ChiTietKyNhanGiaiThoaiDanGianFieldType[]
