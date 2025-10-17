import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    ACHIEVEMENT_FIELDS,
    AchievementType,
    CreateAchievementBodyType,
    UpdateAchievementBodyType
} from './entities/achievement.entity'

@Injectable()
export class AchievementRepo {
    constructor(private prismaService: PrismaService) { }

    list(pagination: PaginationQueryType) {
        const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(pagination.qs, ACHIEVEMENT_FIELDS)
        const skip = (pagination.currentPage - 1) * pagination.pageSize

        return this.prismaService.achievement.findMany({
            where: {
                ...parsedWhere,
                deletedAt: null
            },
            include: {
                land: {
                    select: {
                        id: true,
                        name: true,
                        order: true
                    }
                }
            },
            orderBy: parsedOrderBy || { createdAt: 'desc' },
            skip: skip || 0,
            take: Number(pagination.pageSize) || 10
        })
    }

    findMaxOrder() {
        return this.prismaService.achievement.findFirst({
            where: { deletedAt: null },
            orderBy: { order: 'desc' },
            select: { order: true }
        })
    }

    create({
        createdById,
        data,
        order
    }: {
        createdById: number | null
        data: CreateAchievementBodyType
        order: number
    }): Promise<AchievementType> {
        return this.prismaService.achievement.create({
            data: {
                ...data,
                order,
                createdById
            }
        })
    }

    findMany({
        pagination,
        where,
        orderBy
    }: {
        pagination: PaginationQueryType
        where?: any
        orderBy?: any
    }) {
        const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(pagination.qs, ACHIEVEMENT_FIELDS)
        const skip = (pagination.currentPage - 1) * pagination.pageSize

        return this.prismaService.achievement.findMany({
            where: {
                ...parsedWhere,
                ...where,
                deletedAt: null
            },
            include: {
                land: {
                    select: {
                        id: true,
                        name: true,
                        order: true
                    }
                }
            },
            orderBy: parsedOrderBy || orderBy || { createdAt: 'desc' },
            skip,
            take: pagination.pageSize
        })
    }

    findManyCount({ where }: { where?: any }) {
        return this.prismaService.achievement.count({
            where: {
                ...where,
                deletedAt: null
            }
        })
    }

    findUnique({ id }: { id: number }) {
        return this.prismaService.achievement.findUnique({
            where: { id: Number(id) },
            include: {
                land: {
                    select: {
                        id: true,
                        name: true,
                        order: true
                    }
                }
            }
        })
    }

    update({
        id,
        data,
        updatedById
    }: {
        id: number
        data: UpdateAchievementBodyType
        updatedById: number
    }) {
        return this.prismaService.achievement.update({
            where: { id: Number(id) },
            data: {
                ...data,
                updatedById
            }
        })
    }

    delete({ id, deletedById }: { id: number; deletedById: number }) {
        return this.prismaService.achievement.update({
            where: { id: Number(id) },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        })
    }

    findActiveAchievements() {
        return this.prismaService.achievement.findMany({
            where: {
                isActive: true,
                deletedAt: null
            },
            include: {
                land: {
                    select: {
                        id: true,
                        name: true,
                        order: true
                    }
                }
            },
            orderBy: { order: 'asc' }
        })
    }

    findByType(type: 'KY_NHAN_SUMMARY_COUNT' | 'LAND_COLLECTION') {
        return this.prismaService.achievement.findMany({
            where: {
                type,
                isActive: true,
                deletedAt: null
            },
            include: {
                land: {
                    select: {
                        id: true,
                        name: true,
                        order: true
                    }
                }
            },
            orderBy: { order: 'asc' }
        })
    }
}
