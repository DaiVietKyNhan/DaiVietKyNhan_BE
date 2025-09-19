import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { ChiTietKyNhanType, CreateChiTietKyNhanBodyType, UpdateChiTietKyNhanBodyType, QueryChiTietKyNhanType } from './entities/chitietkynhan.entities';

@Injectable()
export class ChiTietKyNhanRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateChiTietKyNhanBodyType): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.create({
            data,
            include: {
                kyNhan: true,
                media: true,
            },
        });
    }

    async findMany(query: QueryChiTietKyNhanType): Promise<{ data: ChiTietKyNhanType[]; total: number }> {
        const { page, limit, kyNhanId, tinhCach, trichDoan, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null,
        };

        if (kyNhanId) {
            where.kyNhanId = kyNhanId;
        }

        if (tinhCach) {
            where.tinhCach = { contains: tinhCach, mode: 'insensitive' };
        }

        if (trichDoan) {
            where.trichDoan = { contains: trichDoan, mode: 'insensitive' };
        }

        const [data, total] = await Promise.all([
            this.prismaService.chiTietKyNhan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    kyNhan: true,
                    media: true,
                },
            }),
            this.prismaService.chiTietKyNhan.count({ where }),
        ]);

        return { data, total };
    }

    async findFirst(where: { id: number; deletedAt?: any }): Promise<ChiTietKyNhanType | null> {
        return this.prismaService.chiTietKyNhan.findFirst({
            where,
            include: {
                kyNhan: true,
                media: true,
            },
        });
    }

    async update(id: number, data: UpdateChiTietKyNhanBodyType): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.update({
            where: { id },
            data,
            include: {
                kyNhan: true,
                media: true,
            },
        });
    }

    async softDelete(id: number): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async restore(id: number): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.update({
            where: { id },
            data: { deletedAt: null },
            include: {
                kyNhan: true,
                media: true,
            },
        });
    }

    async findFirstDeleted(where: { id: number; deletedAt: { not: null } }): Promise<ChiTietKyNhanType | null> {
        return this.prismaService.chiTietKyNhan.findFirst({
            where,
        });
    }

    async findByKyNhanId(kyNhanId: number): Promise<ChiTietKyNhanType[]> {
        return this.prismaService.chiTietKyNhan.findMany({
            where: { kyNhanId, deletedAt: null },
            include: {
                kyNhan: true,
                media: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findKyNhanById(kyNhanId: number): Promise<any> {
        return this.prismaService.kyNhan.findFirst({
            where: { id: kyNhanId, deletedAt: null },
        });
    }
}
