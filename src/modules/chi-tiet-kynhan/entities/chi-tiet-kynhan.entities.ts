import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema } from './chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.entities'
import { ChiTietKyNhanSuSachVietGiSchema } from './chi-tiet-kynhan-su-sach-viet-gi.entities'
import { ChiTietKyNhanGiaiThoaiDanGianSchema } from '../giai-thoai-dan-gian/entities/chi-tiet-kynhan-giai-thoai-dan-gian.entities'

// Media schema for ChiTietKyNhan
const MediaTypeSchema = z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'])

const MediaSchema = z.object({
    id: z.number(),
    chiTietId: z.number(),
    type: MediaTypeSchema,
    url: z.string().max(1000),
    fileName: z.string().max(500).nullable(),
    fileSize: z.number().nullable(),
    mimeType: z.string().max(100).nullable(),
    thuTu: z.number().default(0),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict()

// User schema for relations
const UserRelationSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    avatar: z.string().nullable()
}).nullable()

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const ChiTietKyNhanSchema = z
    .object({
        id: z.number(),
        kyNhanId: z.number(),
        thamKhao: z.string().nullable(),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
        kyNhan: z.object({
            id: z.number(),
            name: z.string(),
            thoiKy: z.string(),
            chienCong: z.string(),
            imgUrl: z.string().nullable(),
            active: z.boolean()
        }).optional(),
        media: z.array(MediaSchema).optional(),
        boiCanhLichSuVaSuuThan: z.array(ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema).optional(),
        suSachVietGi: z.array(ChiTietKyNhanSuSachVietGiSchema).optional(),
        giaiThoaiDanGian: z.array(ChiTietKyNhanGiaiThoaiDanGianSchema).optional(),
        createdBy: UserRelationSchema,
        updatedBy: UserRelationSchema,
        deletedBy: UserRelationSchema
    })
    .strict()

export const CreateChiTietKyNhanBodySchema = ChiTietKyNhanSchema.pick({
    kyNhanId: true,
    thamKhao: true
}).strict()


export const CreateChiTietKyNhanResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanSchema,
    message: z.string()
})

// Schema cho tạo chi tiết kỳ nhân hoàn chỉnh với tất cả thông tin từ form
export const CreateChiTietKyNhanCompleteBodySchema = z.object({
    // Thông tin cơ bản chi tiết kỳ nhân
    kyNhanId: z.string().transform(val => Number(val)),
    thamKhao: z.string().nullable().optional(),

    // Bối cảnh lịch sử và xuất thân
    boiCanhLichSuVaXuatThan: z.array(z.object({
        tieuDe: z.string().min(1).max(500),
        noiDung: z.string().min(1),
        nguon: z.string().nullable().optional()
    })).optional(),

    // Sử sách viết gì
    suSachVietGi: z.array(z.object({
        tieuDe: z.string().min(1).max(500),
        doanVan: z.string().min(1),
        tacGia: z.string().max(500).nullable().optional(),
        nguonSach: z.string().nullable().optional()
    })).optional(),

    // Giai thoại dân gian và truyền thuyết
    giaiThoaiDanGian: z.array(z.object({
        tieuDe: z.string().min(1).max(500),
        noiDung: z.string().min(1),
        nguon: z.string().nullable().optional()
    })).optional(),

    // Thư viện ảnh (URLs from form data, or files uploaded separately)
    thuVienAnh: z.array(z.object({
        url: z.string().url(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional()
    })).optional()
}).strict()

export const CreateChiTietKyNhanCompleteResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanSchema,
    message: z.string(),
    uploadWarnings: z.array(z.object({
        fileName: z.string(),
        error: z.string()
    })).optional()
})

// Schema cho cập nhật chi tiết kỳ nhân hoàn chỉnh
export const UpdateChiTietKyNhanCompleteBodySchema = z.object({
    thamKhao: z.string().nullable().optional(),

    // Bối cảnh lịch sử và xuất thân
    boiCanhLichSuVaXuatThan: z.array(z.object({
        id: z.number().optional(), // ID nếu update, undefined nếu create mới
        tieuDe: z.string().min(1).max(500),
        noiDung: z.string().min(1),
        nguon: z.string().nullable().optional()
    })).optional(),

    // Sử sách viết gì
    suSachVietGi: z.array(z.object({
        id: z.number().optional(), // ID nếu update, undefined nếu create mới
        tieuDe: z.string().min(1).max(500),
        doanVan: z.string().min(1),
        tacGia: z.string().max(500).nullable().optional(),
        nguonSach: z.string().nullable().optional()
    })).optional(),

    // Giai thoại dân gian và truyền thuyết
    giaiThoaiDanGian: z.array(z.object({
        id: z.number().optional(), // ID nếu update, undefined nếu create mới
        tieuDe: z.string().min(1).max(500),
        noiDung: z.string().min(1),
        nguon: z.string().nullable().optional()
    })).optional(),

    // Thư viện ảnh (URLs from form data, or files uploaded separately)
    thuVienAnh: z.array(z.object({
        id: z.number().optional(), // ID nếu update, undefined nếu create mới
        url: z.string().url(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional()
    })).optional()
}).strict()

export const UpdateChiTietKyNhanCompleteResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanSchema,
    message: z.string(),
    uploadWarnings: z.array(z.object({
        fileName: z.string(),
        error: z.string()
    })).optional()
})

export const UpdateChiTietKyNhanBodySchema = CreateChiTietKyNhanBodySchema.partial().strict()

export const UpdateChiTietKyNhanResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanSchema,
    message: z.string()
})

export const GetChiTietKyNhanParamsSchema = z
    .object({
        chiTietKyNhanId: checkIdSchema('Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanResSchema = z
    .object({
        statusCode: z.number(),
        data: ChiTietKyNhanSchema,
        message: z.string()
    })
    .strict()

export const GetChiTietKyNhanByKyNhanParamsSchema = z
    .object({
        kyNhanId: checkIdSchema('KyNhan Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanListResSchema = z.object({
    statusCode: z.number(),
    data: z.array(ChiTietKyNhanSchema),
    message: z.string()
})

// Types
export type ChiTietKyNhanType = z.infer<typeof ChiTietKyNhanSchema>
export type CreateChiTietKyNhanBodyType = z.infer<typeof CreateChiTietKyNhanBodySchema>
export type CreateChiTietKyNhanCompleteBodyType = z.infer<typeof CreateChiTietKyNhanCompleteBodySchema>
export type CreateChiTietKyNhanCompleteResType = z.infer<typeof CreateChiTietKyNhanCompleteResSchema>
export type UpdateChiTietKyNhanCompleteBodyType = z.infer<typeof UpdateChiTietKyNhanCompleteBodySchema>
export type UpdateChiTietKyNhanCompleteResType = z.infer<typeof UpdateChiTietKyNhanCompleteResSchema>
export type UpdateChiTietKyNhanBodyType = z.infer<typeof UpdateChiTietKyNhanBodySchema>
export type GetChiTietKyNhanParamsType = z.infer<typeof GetChiTietKyNhanParamsSchema>
export type GetChiTietKyNhanResType = z.infer<typeof GetChiTietKyNhanResSchema>
export type GetChiTietKyNhanByKyNhanParamsType = z.infer<typeof GetChiTietKyNhanByKyNhanParamsSchema>

// Fields for query parsing
type ChiTietKyNhanFieldType = keyof z.infer<typeof ChiTietKyNhanSchema>
export const CHI_TIET_KY_NHAN_FIELDS = Object.keys(ChiTietKyNhanSchema.shape) as ChiTietKyNhanFieldType[]
