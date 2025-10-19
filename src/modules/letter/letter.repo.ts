import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { Prisma } from '@prisma/client'

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
                },
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        imgUrl: true
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
                },
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        imgUrl: true
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
                },
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        imgUrl: true
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
                },
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        imgUrl: true
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
        // Đếm số thư chưa đọc của user (isRead = false)
        return this.prismaService.letter.count({
            where: {
                fromUserId: userId,
                isRead: false,
                deletedAt: null
            }
        })
    }

    async findByKyNhanId(kyNhanId: number) {
        // Lấy tất cả thư gửi cho kỳ nhân này
        return this.prismaService.letter.findMany({
            where: {
                kyNhanId,
                deletedAt: null
            },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        imgUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }
}

