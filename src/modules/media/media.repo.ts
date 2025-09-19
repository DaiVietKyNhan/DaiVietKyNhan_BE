import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { MediaSchemaType, CreateMediaBodyType, UpdateMediaBodyType, QueryMediaType } from './entities/media.entities';

@Injectable()
export class MediaRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateMediaBodyType): Promise<MediaSchemaType> {
        return this.prismaService.media.create({
            data,
            include: {
                chiTiet: {
                    include: {
                        kyNhan: true,
                    },
                },
            },
        });
    }

    async findMany(query: QueryMediaType): Promise<{ data: MediaSchemaType[]; total: number }> {
        const { page, limit, chiTietId, type, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (chiTietId) {
            where.chiTietId = chiTietId;
        }

        if (type) {
            where.type = type;
        }

        const [data, total] = await Promise.all([
            this.prismaService.media.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    chiTiet: {
                        include: {
                            kyNhan: true,
                        },
                    },
                },
            }),
            this.prismaService.media.count({ where }),
        ]);

        return { data, total };
    }

    async findUnique(where: { id: number }): Promise<MediaSchemaType | null> {
        return this.prismaService.media.findUnique({
            where,
            include: {
                chiTiet: {
                    include: {
                        kyNhan: true,
                    },
                },
            },
        });
    }

    async update(id: number, data: UpdateMediaBodyType): Promise<MediaSchemaType> {
        return this.prismaService.media.update({
            where: { id },
            data,
            include: {
                chiTiet: {
                    include: {
                        kyNhan: true,
                    },
                },
            },
        });
    }

    async delete(id: number): Promise<MediaSchemaType> {
        return this.prismaService.media.delete({
            where: { id },
        });
    }

    async findByChiTietId(chiTietId: number): Promise<MediaSchemaType[]> {
        return this.prismaService.media.findMany({
            where: { chiTietId },
            include: {
                chiTiet: {
                    include: {
                        kyNhan: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByType(type: string): Promise<MediaSchemaType[]> {
        return this.prismaService.media.findMany({
            where: { type: type as any },
            include: {
                chiTiet: {
                    include: {
                        kyNhan: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findChiTietKyNhanById(chiTietId: number): Promise<any> {
        return this.prismaService.chiTietKyNhan.findFirst({
            where: { id: chiTietId, deletedAt: null },
        });
    }
}
