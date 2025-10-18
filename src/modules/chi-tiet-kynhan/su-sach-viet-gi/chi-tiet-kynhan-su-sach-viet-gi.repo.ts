import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    CHI_TIET_KY_NHAN_SU_SACH_VIET_GI_FIELDS,
    ChiTietKyNhanSuSachVietGiType,
    CreateChiTietKyNhanSuSachVietGiBodyType,
    UpdateChiTietKyNhanSuSachVietGiBodyType
} from './entities/chi-tiet-kynhan-su-sach-viet-gi.entities'

@Injectable()
export class ChiTietKyNhanSuSachVietGiRepo {
    constructor(private prismaService: PrismaService) { }

    async create({
        createdById,
        data
    }: {
        createdById: number | null
        data: CreateChiTietKyNhanSuSachVietGiBodyType
    }): Promise<ChiTietKyNhanSuSachVietGiType> {
        // Tự động tính thuTu nếu không được cung cấp
        const thuTu = data.thuTu !== undefined ? data.thuTu : await this.getNextThuTu(data.chiTietKyNhanId)

        return this.prismaService.chiTietKyNhanSuSachVietGi.create({
            data: {
                ...data,
                thuTu,
                createdById
            }
        })
    }

    private async getNextThuTu(chiTietKyNhanId: number): Promise<number> {
        const lastRecord = await this.prismaService.chiTietKyNhanSuSachVietGi.findFirst({
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
        data: UpdateChiTietKyNhanSuSachVietGiBodyType
    }): Promise<ChiTietKyNhanSuSachVietGiType> {
        return this.prismaService.chiTietKyNhanSuSachVietGi.update({
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
    ): Promise<ChiTietKyNhanSuSachVietGiType> {
        return isHard
            ? this.prismaService.chiTietKyNhanSuSachVietGi.delete({
                where: {
                    id
                }
            })
            : this.prismaService.chiTietKyNhanSuSachVietGi.update({
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
        const { where, orderBy } = parseQs(pagination.qs, CHI_TIET_KY_NHAN_SU_SACH_VIET_GI_FIELDS)

        const skip = (pagination.currentPage - 1) * pagination.pageSize
        const take = pagination.pageSize

        const [totalItems, data] = await Promise.all([
            this.prismaService.chiTietKyNhanSuSachVietGi.count({
                where: { deletedAt: null, ...where }
            }),
            this.prismaService.chiTietKyNhanSuSachVietGi.findMany({
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

    findById(id: number): Promise<ChiTietKyNhanSuSachVietGiType | null> {
        return this.prismaService.chiTietKyNhanSuSachVietGi.findUnique({
            where: {
                id,
                deletedAt: null
            },
            include: {
                chiTietKyNhan: true
            }
        })
    }

    findByChiTietKyNhanId(chiTietKyNhanId: number): Promise<ChiTietKyNhanSuSachVietGiType[]> {
        return this.prismaService.chiTietKyNhanSuSachVietGi.findMany({
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

    findExistByTitleAndChiTiet(tieuDe: string, chiTietKyNhanId: number): Promise<ChiTietKyNhanSuSachVietGiType | null> {
        return this.prismaService.chiTietKyNhanSuSachVietGi.findFirst({
            where: {
                tieuDe,
                chiTietKyNhanId,
                deletedAt: null
            }
        })
    }
}
