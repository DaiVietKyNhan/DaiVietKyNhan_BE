import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { Prisma } from '@prisma/client'
import { PaginationQueryType } from '@/shared/models/request.model'
import { parseQs } from '@/common/utils/qs-parser'
import { LETTER_FIELDS } from './entities/letter.entity'

@Injectable()
export class LetterRepo {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: Prisma.LetterCreateInput) {
        return this.prismaService.letter.create({
            data,
            include: {
                fromUser: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })
    }

    async findById(id: number) {
        return this.prismaService.letter.findUnique({
            where: { id },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })
    }

    async findByUserId(userId: number) {
        return this.prismaService.letter.findMany({
            where: {
                fromUserId: userId,
                deletedAt: null
            },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async update(id: number, data: Prisma.LetterUpdateInput) {
        return this.prismaService.letter.update({
            where: { id },
            data,
            include: {
                fromUser: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })
    }

    async delete(id: number, deletedById: number) {
        return this.prismaService.letter.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        })
    }

    async countSentLetters(userId: number) {
        return this.prismaService.letter.count({
            where: {
                fromUserId: userId,
                deletedAt: null
            }
        })
    }

    async getUnreadCount(userId: number) {
        // Đếm số thư của user (không còn isRead, có thể dùng status nếu cần)
        return this.prismaService.letter.count({
            where: {
                fromUserId: userId,
                deletedAt: null
            }
        })
    }

    async findByToName(toName: string) {
        // Lấy tất cả thư gửi cho tên này
        return this.prismaService.letter.findMany({
            where: {
                to: toName,
                deletedAt: null
            },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async list(pagination: PaginationQueryType) {
        const { where, orderBy } = parseQs(pagination.qs, LETTER_FIELDS)

        // Initialize where clause if undefined
        const whereClause = where || {}

        // Validate and transform where clause for Letter model
        const validStatuses = ['PENDING', 'REMOVE', 'PUBLIC']
        if (whereClause.status && !validStatuses.includes(whereClause.status)) {
            throw new BadRequestException(`Invalid status: ${whereClause.status}. Valid values are: ${validStatuses.join(', ')}`)
        }

        // Convert isFirstPublic from string to boolean if present
        if (whereClause.isFirstPublic !== undefined) {
            if (typeof whereClause.isFirstPublic === 'string') {
                whereClause.isFirstPublic = whereClause.isFirstPublic === 'true'
            }
        }

        const skip = (pagination.currentPage - 1) * pagination.pageSize
        const take = pagination.pageSize

        const [totalItems, data] = await Promise.all([
            this.prismaService.letter.count({
                where: { deletedAt: null, ...whereClause }
            }),
            this.prismaService.letter.findMany({
                where: { deletedAt: null, ...whereClause },
                include: {
                    fromUser: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                },
                orderBy: orderBy || { createdAt: 'desc' },
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
}

