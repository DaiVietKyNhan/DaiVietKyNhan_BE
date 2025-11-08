import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { Prisma } from '@prisma/client'
import { parseQs } from '@/common/utils/qs-parser'
import { LETTER_FIELDS, ListLetterQueryType } from './entities/letter.entity'

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

    async list(query: ListLetterQueryType, userId: number) {
        // Extract filterByUserId - Zod schema should have already handled the conversion
        // Default to true if undefined (for safety/backwards compatibility)
        const shouldFilterByUserId = query.filterByUserId ?? true
        const { filterByUserId: _, ...pagination } = query

        // Debug log (remove in production)
        console.log('DEBUG - Raw filterByUserId from query:', query.filterByUserId, 'type:', typeof query.filterByUserId)
        console.log('DEBUG - Processed shouldFilterByUserId:', shouldFilterByUserId, 'userId:', userId)

        // Extract email search from query string before parsing (email is not in LETTER_FIELDS)
        let emailSearch: string | undefined
        let qsWithoutEmail = pagination.qs

        if (pagination.qs) {
            const parts = pagination.qs.split(',').map((p) => p.trim()).filter(Boolean)
            const emailParts: string[] = []
            const otherParts: string[] = []

            for (const part of parts) {
                if (part.startsWith('email:like=') || part.startsWith('email=')) {
                    emailParts.push(part)
                } else {
                    otherParts.push(part)
                }
            }

            if (emailParts.length > 0) {
                // Extract email value (support both email:like=value and email=value)
                const emailPart = emailParts[0]
                if (emailPart.startsWith('email:like=')) {
                    emailSearch = emailPart.substring('email:like='.length)
                } else if (emailPart.startsWith('email=')) {
                    emailSearch = emailPart.substring('email='.length)
                }
            }

            qsWithoutEmail = otherParts.join(',')
        }

        const { where, orderBy } = parseQs(qsWithoutEmail, LETTER_FIELDS)

        // Initialize where clause
        const whereClause: Prisma.LetterWhereInput = {
            ...where
        }

        // Validate and transform where clause for Letter model
        const validStatuses = ['PENDING', 'REMOVE', 'PUBLIC']
        if (whereClause.status && !validStatuses.includes(whereClause.status as string)) {
            throw new BadRequestException(`Invalid status: ${whereClause.status}. Valid values are: ${validStatuses.join(', ')}`)
        }

        // Convert isFirstPublic from string to boolean if present
        if (whereClause.isFirstPublic !== undefined) {
            if (typeof whereClause.isFirstPublic === 'string') {
                whereClause.isFirstPublic = whereClause.isFirstPublic === 'true'
            }
        }

        // Build fromUser filter (combine userId filter and email search)
        const fromUserFilter: Prisma.UserWhereInput = {}

        // Filter by userId only if shouldFilterByUserId is explicitly true
        // Note: shouldFilterByUserId is already a boolean from Zod schema
        if (shouldFilterByUserId === true) {
            fromUserFilter.id = userId
        }

        // Add email search to fromUser filter (can be combined with userId filter or used alone)
        if (emailSearch) {
            fromUserFilter.email = {
                contains: emailSearch,
                mode: 'insensitive'
            }
        }

        // Only add fromUser filter if we have at least one condition
        // If filterByUserId is false and no emailSearch, fromUserFilter will be empty
        // and we won't add it to whereClause, allowing all letters to be retrieved
        if (Object.keys(fromUserFilter).length > 0) {
            whereClause.fromUser = fromUserFilter
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
                            avatar: true,
                            email: true // Include email in response for verification
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

