import { checkIdSchema } from '@/common/utils/id.validation'
import { ENTITY_MESSAGE } from '@/common/constants/message'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

export const ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema = z
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

export const CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema = ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema.pick({
    chiTietKyNhanId: true,
    tieuDe: true,
    noiDung: true,
    nguon: true,
    thuTu: true
}).strict()

export const CreateChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema,
    message: z.string()
})

export const UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema = CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema.partial().strict()

export const UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema = z.object({
    statusCode: z.number(),
    data: ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema,
    message: z.string()
})

export const GetChiTietKyNhanBoiCanhLichSuVaSuuThanParamsSchema = z
    .object({
        boiCanhLichSuVaSuuThanId: checkIdSchema('Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema = z
    .object({
        statusCode: z.number(),
        data: ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema,
        message: z.string()
    })
    .strict()

export const GetChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietParamsSchema = z
    .object({
        chiTietKyNhanId: checkIdSchema('ChiTietKyNhan Id không hợp lệ')
    })
    .strict()

export const GetChiTietKyNhanBoiCanhLichSuVaSuuThanListResSchema = z.object({
    statusCode: z.number(),
    data: z.array(ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema),
    message: z.string()
})

// Types
export type ChiTietKyNhanBoiCanhLichSuVaSuuThanType = z.infer<typeof ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema>
export type CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType = z.infer<typeof CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema>
export type UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType = z.infer<typeof UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodySchema>
export type GetChiTietKyNhanBoiCanhLichSuVaSuuThanParamsType = z.infer<typeof GetChiTietKyNhanBoiCanhLichSuVaSuuThanParamsSchema>
export type GetChiTietKyNhanBoiCanhLichSuVaSuuThanResType = z.infer<typeof GetChiTietKyNhanBoiCanhLichSuVaSuuThanResSchema>
export type GetChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietParamsType = z.infer<typeof GetChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietParamsSchema>

// Fields for query parsing
type ChiTietKyNhanBoiCanhLichSuVaSuuThanFieldType = keyof z.infer<typeof ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema>
export const CHI_TIET_KY_NHAN_BOI_CANH_LICH_SU_VA_SUU_THAN_FIELDS = Object.keys(ChiTietKyNhanBoiCanhLichSuVaSuuThanSchema.shape) as ChiTietKyNhanBoiCanhLichSuVaSuuThanFieldType[]
