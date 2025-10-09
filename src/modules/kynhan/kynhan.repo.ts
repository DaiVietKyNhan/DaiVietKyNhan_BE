import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import {
  CreateKyNhanBodyType,
  KyNhanType,
  QueryKyNhanType,
  UpdateKyNhanBodyType
} from './entities/kynhan.entities'

@Injectable()
export class KyNhanRepository {
  constructor(private readonly prismaService: PrismaService) {}

  //#region create
  async create(data: CreateKyNhanBodyType): Promise<KyNhanType> {
    return this.prismaService.kyNhan.create({
      data,
      include: {
        chiTietKyNhans: {
          where: { deletedAt: null },
          include: {
            media: true
          }
        }
      }
    })
  }
  //#endregion

  //#region update
  async update(id: number, data: UpdateKyNhanBodyType): Promise<KyNhanType> {
    return this.prismaService.kyNhan.update({
      where: { id },
      data,
      include: {
        chiTietKyNhans: {
          where: { deletedAt: null },
          include: {
            media: true
          }
        }
      }
    })
  }
  //#endregion

  //#region remove
  async softDelete(id: number): Promise<KyNhanType> {
    return this.prismaService.kyNhan.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }
  //#endregion

  //#region restore
  async restore(id: number): Promise<KyNhanType> {
    return this.prismaService.kyNhan.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        chiTietKyNhans: {
          where: { deletedAt: null },
          include: {
            media: true
          }
        }
      }
    })
  }
  //#endregion

  //#region findFirstDeleted
  async findFirstDeleted(where: {
    id: number
    deletedAt: { not: null }
  }): Promise<KyNhanType | null> {
    return this.prismaService.kyNhan.findFirst({
      where
    })
  }
  //#endregion

  //#region findMany
  async findMany(query: QueryKyNhanType): Promise<{ data: KyNhanType[]; total: number }> {
    const { page, limit, search, thoiKy, active, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    const where: any = {
      deletedAt: null
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { thoiKy: { contains: search, mode: 'insensitive' } },
        { chienCong: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (thoiKy) {
      where.thoiKy = { contains: thoiKy, mode: 'insensitive' }
    }

    if (active !== undefined) {
      where.active = active
    }

    const [data, total] = await Promise.all([
      this.prismaService.kyNhan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          chiTietKyNhans: {
            where: { deletedAt: null },
            include: {
              media: true
            }
          }
        }
      }),
      this.prismaService.kyNhan.count({ where })
    ])

    return { data, total }
  }
  //#endregion

  //#region findFirst
  async findFirst(where: { id: number; deletedAt?: any }): Promise<KyNhanType | null> {
    return this.prismaService.kyNhan.findFirst({
      where,
      include: {
        chiTietKyNhans: {
          where: { deletedAt: null },
          include: {
            media: true
          }
        }
      }
    })
  }
  //#endregion
}
