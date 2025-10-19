import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    CHI_TIET_KY_NHAN_GIAI_THOAI_DAN_GIAN_FIELDS,
    ChiTietKyNhanGiaiThoaiDanGianType,
    CreateChiTietKyNhanGiaiThoaiDanGianBodyType,
    UpdateChiTietKyNhanGiaiThoaiDanGianBodyType
} from './entities/chi-tiet-kynhan-giai-thoai-dan-gian.entities'

@Injectable()
export class ChiTietKyNhanGiaiThoaiDanGianRepo {
    constructor(private prismaService: PrismaService) { }

    async create({
        createdById,
        data
    }: {
        createdById: number | null
        data: CreateChiTietKyNhanGiaiThoaiDanGianBodyType
    }): Promise<ChiTietKyNhanGiaiThoaiDanGianType> {
        // Tự động tính thuTu nếu không được cung cấp
        const thuTu = data.thuTu !== undefined ? data.thuTu : await this.getNextThuTu(data.chiTietKyNhanId)
        
        return this.prismaService.chiTietKyNhanGiaiThoaiDanGian.create({
            data: {
                ...data,
                thuTu,
                createdById
            }
        })
    }

    private async getNextThuTu(chiTietKyNhanId: number): Promise<number> {
        const lastRecord = await this.prismaService.chiTietKyNhanGiaiThoaiDanGian.findFirst({
            where: {
                chiTietKyNhanId,
                deletedAt: null
            },
            orderBy: {
                thuTu: 'desc'
            },
            select: {
                thuTu: true
            }
        })
        
        return (lastRecord?.thuTu || 0) + 1
    }

    update({
        id,
        updatedById,
        data
    }: {
        id: number
        updatedById: number
        data: UpdateChiTietKyNhanGiaiThoaiDanGianBodyType
    }): Promise<ChiTietKyNhanGiaiThoaiDanGianType> {
        return this.prismaService.chiTietKyNhanGiaiThoaiDanGian.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                ...data,
                updatedById
            }
        })
    }

    delete(
        {
            id,
            deletedById
        }: {
            id: number
            deletedById: number
        },
        isHard?: boolean
    ): Promise<ChiTietKyNhanGiaiThoaiDanGianType> {
        return isHard
            ? this.prismaService.chiTietKyNhanGiaiThoaiDanGian.delete({
                where: {
                    id
                }
            })
            : this.prismaService.chiTietKyNhanGiaiThoaiDanGian.update({
                where: {
                    id,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date(),
                    deletedById
                }
            })
    }

    async list(pagination: PaginationQueryType) {
        const { where, orderBy } = parseQs(pagination.qs, CHI_TIET_KY_NHAN_GIAI_THOAI_DAN_GIAN_FIELDS)

        const skip = (pagination.currentPage - 1) * pagination.pageSize
        const take = pagination.pageSize

        const [totalItems, data] = await Promise.all([
            this.prismaService.chiTietKyNhanGiaiThoaiDanGian.count({
                where: { deletedAt: null, ...where }
            }),
            this.prismaService.chiTietKyNhanGiaiThoaiDanGian.findMany({
                where: { deletedAt: null, ...where },
                include: {
                    chiTietKyNhan: true
                },
                orderBy,
                skip,
                take
            })
        ])

        return {
            results: data,
            pagination: {
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
                totalPage: Math.ceil(totalItems / pagination.pageSize),
                totalItem: totalItems
            }
        }
    }

    findById(id: number): Promise<ChiTietKyNhanGiaiThoaiDanGianType | null> {
        return this.prismaService.chiTietKyNhanGiaiThoaiDanGian.findUnique({
            where: {
                id,
                deletedAt: null
            },
            include: {
                chiTietKyNhan: true
            }
        })
    }

    findByChiTietKyNhanId(chiTietKyNhanId: number): Promise<ChiTietKyNhanGiaiThoaiDanGianType[]> {
        return this.prismaService.chiTietKyNhanGiaiThoaiDanGian.findMany({
            where: {
                chiTietKyNhanId,
                deletedAt: null
            },
            include: {
                chiTietKyNhan: true
            },
            orderBy: {
                thuTu: 'asc',
                createdAt: 'asc'
            }
        })
    }

    findExistByTitleAndChiTiet(tieuDe: string, chiTietKyNhanId: number): Promise<ChiTietKyNhanGiaiThoaiDanGianType | null> {
        return this.prismaService.chiTietKyNhanGiaiThoaiDanGian.findFirst({
            where: {
                tieuDe,
                chiTietKyNhanId,
                deletedAt: null
            }
        })
    }
}
