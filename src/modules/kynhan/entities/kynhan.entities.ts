import { checkIdSchema } from '@/common/utils/id.validation'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const KyNhanSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1).max(255),
    thoiKy: z.string().min(1),
    chienCong: z.string().min(1),
    imgUrl: z.string().max(1000).nullable(),
    active: z.boolean().default(false),
    landId: z.number().nullable(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateKyNhanBodySchema = KyNhanSchema.pick({
  name: true,
  thoiKy: true,
  chienCong: true,
  landId: true,
  imgUrl: true,
  active: true
}).strict()

export const CreateKyNhanResSchema = z.object({
  statusCode: z.number(),
  data: KyNhanSchema,
  message: z.string()
})

// Schema cho tạo kỳ nhân hoàn chỉnh với tất cả thông tin từ form
export const CreateKyNhanCompleteBodySchema = z
  .object({
    // Thông tin cơ bản kỳ nhân
    name: z.string().min(1).max(500),
    thoiKy: z.string().min(1),
    chienCong: z.string().min(1),
    landId: z.number().nullable().optional(),
    active: z.boolean().default(false),

    // Thông tin hình ảnh cơ bản (từ form đầu tiên)
    thongTinHinh: z
      .object({
        tenHinh: z.string().min(1).max(500),
        tomTatHinh: z.string().min(1).max(1000),
        moTaNgan: z.string().min(1)
      })
      .optional(),

    // Thông tin cơ bản (các phần có thể có nhiều)
    thongTinCoBan: z
      .array(
        z.object({
          tieuDePhan: z.string().min(1).max(500),
          noiDung: z.string().min(1)
        })
      )
      .optional(),

    // Chi tiết kỳ nhân
    chiTietKyNhan: z.object({
      ten: z.string().min(1).max(500),
      tinhCach: z.string().min(1),
      quanHe: z.string().nullable().optional(),
      trichDoan: z.string().min(1),
      imgUrl: z.string().nullable().optional(),

      // Bối cảnh lịch sử và xuất thân
      boiCanhLichSuVaXuatThan: z
        .array(
          z.object({
            tieuDe: z.string().min(1).max(500),
            noiDung: z.string().min(1),
            nguon: z.string().nullable().optional()
          })
        )
        .optional(),

      // Sử sách viết gì
      suSachVietGi: z
        .array(
          z.object({
            tieuDe: z.string().min(1).max(500),
            doanVan: z.string().min(1),
            tacGia: z.string().max(500).nullable().optional(),
            nguonSach: z.string().nullable().optional()
          })
        )
        .optional(),

      // Giai thoại dân gian và truyền thuyết
      giaiThoaiDanGian: z
        .array(
          z.object({
            tieuDe: z.string().min(1).max(500),
            noiDung: z.string().min(1),
            nguon: z.string().nullable().optional()
          })
        )
        .optional(),

      // Tham khảo
      thamKhao: z.string().nullable().optional(),

      // Thư viện ảnh
      thuVienAnh: z
        .array(
          z.object({
            url: z.string().url(),
            fileName: z.string().optional(),
            fileSize: z.number().optional(),
            mimeType: z.string().optional()
          })
        )
        .optional()
    })
  })
  .strict()

export const CreateKyNhanCompleteResSchema = z.object({
  statusCode: z.number(),
  data: KyNhanSchema.extend({
    chiTietKyNhans: z.array(
      z.object({
        id: z.number(),
        ten: z.string(),
        tinhCach: z.string(),
        quanHe: z.string().nullable(),
        trichDoan: z.string()
      })
    )
  }),
  message: z.string(),
  uploadWarnings: z.array(z.string()).optional()
})

export const GetKyNhansUserSchema = z.array(
  KyNhanSchema.extend({
    unlocked: z.boolean().default(false)
  })
)

export const GetKyNhansUserResSchema = z.object({
  statusCode: z.number(),
  data: GetKyNhansUserSchema,
  message: z.string()
})

export const UpdateKyNhanBodySchema = CreateKyNhanBodySchema.partial().strict()

export const UpdateKyNhanResSchema = z.object({
  statusCode: z.number(),
  data: KyNhanSchema,
  message: z.string()
})

export const GetKyNhanParamsSchema = z
  .object({
    kyNhanId: checkIdSchema('Id không hợp lệ')
  })
  .strict()

export const GetKyNhanResSchema = z
  .object({
    statusCode: z.number(),
    data: KyNhanSchema,
    message: z.string()
  })
  .strict()

// Types
export type KyNhanType = z.infer<typeof KyNhanSchema>
export type CreateKyNhanBodyType = z.infer<typeof CreateKyNhanBodySchema>
export type CreateKyNhanCompleteBodyType = z.infer<typeof CreateKyNhanCompleteBodySchema>
export type CreateKyNhanCompleteResType = z.infer<typeof CreateKyNhanCompleteResSchema>
export type UpdateKyNhanBodyType = z.infer<typeof UpdateKyNhanBodySchema>
export type GetKyNhanParamsType = z.infer<typeof GetKyNhanParamsSchema>
export type GetKyNhanResType = z.infer<typeof GetKyNhanResSchema>

//field
type KyNhanFieldType = keyof z.infer<typeof KyNhanSchema>
export const KYNHAN_FIELDS = Object.keys(KyNhanSchema.shape) as KyNhanFieldType[]
