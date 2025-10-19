import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    CHI_TIET_KY_NHAN_FIELDS,
    ChiTietKyNhanType,
    CreateChiTietKyNhanBodyType,
    UpdateChiTietKyNhanBodyType
} from './entities/chi-tiet-kynhan.entities'

@Injectable()
export class ChiTietKyNhanRepo {
    constructor(private prismaService: PrismaService) { }

    private get includeWithRelations() {
        return {
            kyNhan: {
                select: {
                    id: true,
                    name: true,
                    thoiKy: true,
                    chienCong: true,
                    imgUrl: true,
                    active: true
                }
            },
            media: {
                where: {
                    deletedAt: null
                },
                orderBy: [
                    {
                        thuTu: Prisma.SortOrder.asc
                    },
                    {
                        createdAt: Prisma.SortOrder.asc
                    }
                ]
            },
            boiCanhLichSuVaSuuThan: {
                where: {
                    deletedAt: null
                },
                orderBy: {
                    thuTu: Prisma.SortOrder.asc
                }
            },
            suSachVietGi: {
                where: {
                    deletedAt: null
                },
                orderBy: {
                    thuTu: Prisma.SortOrder.asc
                }
            },
            giaiThoaiDanGian: {
                where: {
                    deletedAt: null
                },
                orderBy: {
                    thuTu: Prisma.SortOrder.asc
                }
            },
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true
                }
            },
            updatedBy: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true
                }
            },
            deletedBy: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true
                }
            }
        }
    }

    create({
        createdById,
        data
    }: {
        createdById: number | null
        data: CreateChiTietKyNhanBodyType
    }): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.create({
            data: {
                ...data,
                createdById
            },
            include: this.includeWithRelations
        }) as Promise<ChiTietKyNhanType>
    }

    update({
        id,
        updatedById,
        data
    }: {
        id: number
        updatedById: number
        data: UpdateChiTietKyNhanBodyType
    }): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                ...data,
                updatedById
            },
            include: this.includeWithRelations
        }) as Promise<ChiTietKyNhanType>
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
    ): Promise<ChiTietKyNhanType> {
        return isHard
            ? (this.prismaService.chiTietKyNhan.delete({
                where: {
                    id
                },
                include: this.includeWithRelations
            }) as Promise<ChiTietKyNhanType>)
            : (this.prismaService.chiTietKyNhan.update({
                where: {
                    id,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date(),
                    deletedById
                },
                include: this.includeWithRelations
            }) as Promise<ChiTietKyNhanType>)
    }

    async list(pagination: PaginationQueryType) {
        const { where, orderBy } = parseQs(pagination.qs, CHI_TIET_KY_NHAN_FIELDS)

        const skip = (pagination.currentPage - 1) * pagination.pageSize
        const take = pagination.pageSize

        const [totalItems, data] = await Promise.all([
            this.prismaService.chiTietKyNhan.count({
                where: { deletedAt: null, ...where }
            }),
            this.prismaService.chiTietKyNhan.findMany({
                where: { deletedAt: null, ...where },
                include: this.includeWithRelations,
                orderBy,
                skip,
                take
            }) as Promise<ChiTietKyNhanType[]>
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

    findById(id: number): Promise<ChiTietKyNhanType | null> {
        return this.prismaService.chiTietKyNhan.findUnique({
            where: {
                id,
                deletedAt: null
            },
            include: this.includeWithRelations
        }) as Promise<ChiTietKyNhanType | null>
    }

    findByKyNhanId(kyNhanId: number): Promise<ChiTietKyNhanType[]> {
        return this.prismaService.chiTietKyNhan.findMany({
            where: {
                kyNhanId,
                deletedAt: null
            },
            include: this.includeWithRelations,
            orderBy: {
                createdAt: Prisma.SortOrder.asc
            }
        }) as Promise<ChiTietKyNhanType[]>
    }

    findExistByNameAndKyNhan(ten: string, kyNhanId: number): Promise<ChiTietKyNhanType | null> {
        return this.prismaService.chiTietKyNhan.findFirst({
            where: {
                ten,
                kyNhanId,
                deletedAt: null
            },
            include: this.includeWithRelations
        }) as Promise<ChiTietKyNhanType | null>
    }
}
