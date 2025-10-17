import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    USER_REWARD_FIELDS,
    UserRewardType,
    CreateUserRewardBodyType,
    UpdateUserRewardBodyType
} from './entities/user-reward.entity'

@Injectable()
export class UserRewardRepo {
    constructor(private prismaService: PrismaService) { }

    create({
        createdById,
        data
    }: {
        createdById: number | null
        data: CreateUserRewardBodyType
    }): Promise<UserRewardType> {
        return this.prismaService.userReward.create({
            data: {
                ...data,
                createdById
            },
            include: {
                reward: true
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
        const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(pagination.qs, USER_REWARD_FIELDS)
        const skip = (pagination.currentPage - 1) * pagination.pageSize

        return this.prismaService.userReward.findMany({
            where: {
                ...parsedWhere,
                ...where,
                deletedAt: null
            },
            include: {
                reward: true
            },
            orderBy: parsedOrderBy || orderBy || { createdAt: 'desc' },
            skip,
            take: pagination.pageSize
        })
    }

    findManyCount({ where }: { where?: any }) {
        return this.prismaService.userReward.count({
            where: {
                ...where,
                deletedAt: null
            }
        })
    }

    findUnique({ id }: { id: number }) {
        return this.prismaService.userReward.findUnique({
            where: { id },
            include: {
                reward: true
            }
        })
    }

    findByUserAndReward({ userId, rewardId }: { userId: number; rewardId: number }) {
        return this.prismaService.userReward.findUnique({
            where: {
                userId_rewardId: {
                    userId,
                    rewardId
                }
            },
            include: {
                reward: true
            }
        })
    }

    update({
        id,
        data,
        updatedById
    }: {
        id: number
        data: UpdateUserRewardBodyType
        updatedById: number
    }) {
        return this.prismaService.userReward.update({
            where: { id },
            data: {
                ...data,
                updatedById
            },
            include: {
                reward: true
            }
        })
    }

    upsert({
        userId,
        rewardId,
        data,
        createdById,
        updatedById
    }: {
        userId: number
        rewardId: number
        data: CreateUserRewardBodyType
        createdById: number
        updatedById: number
    }) {
        return this.prismaService.userReward.upsert({
            where: {
                userId_rewardId: {
                    userId,
                    rewardId
                }
            },
            create: {
                ...data,
                userId,
                rewardId,
                createdById
            },
            update: {
                ...data,
                updatedById
            },
            include: {
                reward: true
            }
        })
    }

    delete({ id, deletedById }: { id: number; deletedById: number }) {
        return this.prismaService.userReward.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        })
    }

    findByUserId(userId: number) {
        return this.prismaService.userReward.findMany({
            where: {
                userId,
                deletedAt: null
            },
            include: {
                reward: true
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    findByUserIdAndStatus(userId: number, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') {
        return this.prismaService.userReward.findMany({
            where: {
                userId,
                status,
                deletedAt: null
            },
            include: {
                reward: true
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    countUserRewardsByRewardId(rewardId: number) {
        return this.prismaService.userReward.count({
            where: {
                rewardId,
                status: 'COMPLETED',
                deletedAt: null
            }
        })
    }
}
