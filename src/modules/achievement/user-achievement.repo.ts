import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    USER_ACHIEVEMENT_FIELDS,
    UserAchievementType,
    CreateUserAchievementBodyType,
    UpdateUserAchievementBodyType
} from './entities/user-achievement.entity'

@Injectable()
export class UserAchievementRepo {
    constructor(private prismaService: PrismaService) { }

    list(pagination: PaginationQueryType) {
        const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(pagination.qs, USER_ACHIEVEMENT_FIELDS)
        const skip = (pagination.currentPage - 1) * pagination.pageSize

        return this.prismaService.userAchievement.findMany({
            where: {
                ...parsedWhere,
                deletedAt: null
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            },
            orderBy: parsedOrderBy || { createdAt: 'desc' },
            skip: skip || 0,
            take: Number(pagination.pageSize) || 10
        })
    }

    create({
        createdById,
        data
    }: {
        createdById: number | null
        data: CreateUserAchievementBodyType
    }): Promise<UserAchievementType> {
        return this.prismaService.userAchievement.create({
            data: {
                ...data,
                createdById
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            }
        })
    }

    /**
     * Create PENDING user-achievements for all active achievements
     * Idempotent due to skipDuplicates on (userId, achievementId)
     */
    async createManyForUserFromActiveAchievements(userId: number, createdById: number) {
        const achievements = await this.prismaService.achievement.findMany({
            where: { isActive: true, deletedAt: null },
            select: { id: true }
        })

        if (!achievements.length) return { count: 0 }

        const rows = achievements.map((a) => ({
            userId,
            achievementId: a.id,
            status: 'PENDING' as const,
            completedAt: null,
            rewardClaimed: false,
            createdById
        }))

        return this.prismaService.userAchievement.createMany({
            data: rows,
            skipDuplicates: true
        })
    }

    /**
     * Create a specific achievement for all active users
     * Called when a new achievement is added to the system
     */
    async createAchievementForAllUsers(achievementId: number, createdById: number) {
        // Get all active users
        const users = await this.prismaService.user.findMany({
            where: {
                status: 'ACTIVE',
                deletedAt: null
            },
            select: { id: true }
        })

        if (!users.length) return { count: 0 }

        const rows = users.map((user) => ({
            userId: user.id,
            achievementId,
            status: 'PENDING' as const,
            completedAt: null,
            rewardClaimed: false,
            createdById
        }))

        return this.prismaService.userAchievement.createMany({
            data: rows,
            skipDuplicates: true
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
        const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(pagination.qs, USER_ACHIEVEMENT_FIELDS)
        const skip = (pagination.currentPage - 1) * pagination.pageSize

        return this.prismaService.userAchievement.findMany({
            where: {
                ...parsedWhere,
                ...where,
                deletedAt: null
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            },
            orderBy: parsedOrderBy || orderBy || { createdAt: 'desc' },
            skip,
            take: pagination.pageSize
        })
    }

    findManyCount({ where }: { where?: any }) {
        return this.prismaService.userAchievement.count({
            where: {
                ...where,
                deletedAt: null
            }
        })
    }

    findUnique({ id }: { id: number }) {
        return this.prismaService.userAchievement.findUnique({
            where: { id: Number(id) },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            }
        })
    }

    findByUserAndAchievement({ userId, achievementId }: { userId: number; achievementId: number }) {
        return this.prismaService.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId
                }
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
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
        data: UpdateUserAchievementBodyType
        updatedById: number
    }) {
        return this.prismaService.userAchievement.update({
            where: { id: Number(id) },
            data: {
                ...data,
                updatedById
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            }
        })
    }

    upsert({
        userId,
        achievementId,
        data,
        createdById,
        updatedById
    }: {
        userId: number
        achievementId: number
        data: CreateUserAchievementBodyType
        createdById: number
        updatedById: number
    }) {
        return this.prismaService.userAchievement.upsert({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId
                }
            },
            create: {
                ...data,
                userId,
                achievementId,
                createdById
            },
            update: {
                ...data,
                updatedById
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            }
        })
    }

    delete({ id, deletedById }: { id: number; deletedById: number }) {
        return this.prismaService.userAchievement.update({
            where: { id: Number(id) },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        })
    }

    findByUserId(userId: number) {
        return this.prismaService.userAchievement.findMany({
            where: {
                userId,
                deletedAt: null
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    findByUserIdAndStatus(userId: number, status: 'PENDING' | 'COMPLETED' | 'CLAIMED') {
        return this.prismaService.userAchievement.findMany({
            where: {
                userId,
                status,
                deletedAt: null
            },
            include: {
                achievement: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                name: true,
                                order: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }
}
