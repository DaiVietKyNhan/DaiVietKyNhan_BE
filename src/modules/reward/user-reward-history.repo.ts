import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRewardHistoryRepo {
    constructor(private prisma: PrismaService) { }

    async create(params: {
        data: Prisma.UserRewardHistoryCreateInput
        createdById: number
    }) {
        const { data, createdById } = params
        return this.prisma.userRewardHistory.create({
            data: {
                ...data,
                createdBy: { connect: { id: createdById } }
            },
            include: {
                reward: true,
                user: true
            }
        })
    }

    async findByUserId(userId: number) {
        return this.prisma.userRewardHistory.findMany({
            where: {
                userId,
                deletedAt: null
            },
            include: {
                reward: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async list(pagination: PaginationQueryType) {
        const { currentPage = 1, pageSize = 10 } = pagination
        const skip = (currentPage - 1) * pageSize

        const [total, data] = await Promise.all([
            this.prisma.userRewardHistory.count({
                where: {
                    deletedAt: null
                }
            }),
            this.prisma.userRewardHistory.findMany({
                where: {
                    deletedAt: null
                },
                include: {
                    reward: true,
                    user: true
                },
                skip,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ])

        return {
            total,
            data,
            currentPage,
            pageSize,
            totalPage: Math.ceil(total / pageSize)
        }
    }
}
