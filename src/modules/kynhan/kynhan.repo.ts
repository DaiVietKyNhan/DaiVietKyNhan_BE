import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateKyNhanBodyType,
  KYNHAN_FIELDS,
  KyNhanType,
  UpdateKyNhanBodyType
} from './entities/kynhan.entities'

@Injectable()
export class KynhanRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateKyNhanBodyType
  }): Promise<KyNhanType> {
    return this.prismaService.kyNhan.create({
      data: {
        ...data,
        createdById
      }
    })
  }

  update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateKyNhanBodyType
  }): Promise<KyNhanType> {
    return this.prismaService.kyNhan.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
      }
    })
  }

  delete(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<KyNhanType> {
    return isHard
      ? this.prismaService.kyNhan.delete({
          where: {
            id
          }
        })
      : this.prismaService.kyNhan.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedAt: new Date(),
            deletedById
          }
        })
  }

  async list(pagination: PaginationQueryType) {
    const { where, orderBy } = parseQs(pagination.qs, KYNHAN_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.kyNhan.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.kyNhan.findMany({
        where: { deletedAt: null, ...where },

        orderBy,
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

  findById(id: number): Promise<KyNhanType | null> {
    return this.prismaService.kyNhan.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findExistByName(name: string): Promise<KyNhanType | null> {
    return this.prismaService.kyNhan.findFirst({
      where: {
        name,
        deletedAt: null
      }
    })
  }

  async getListByUser(
    userId: number,
    pagination: PaginationQueryType
  ): Promise<(KyNhanType & { unlocked: boolean })[]> {
    const { where, orderBy } = parseQs(pagination.qs || '', KYNHAN_FIELDS)

    // Fetch user's KyNhan IDs
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
        deletedAt: null
      },
      select: {
        userKynhans: {
          select: {
            id: true
          }
        }
      }
    })

    const userKyNhanIds = new Set(user?.userKynhans.map((k) => k.id) ?? [])

    // Fetch KyNhan records with filter and sort from qs
    const allKyNhans = await this.prismaService.kyNhan.findMany({
      where: {
        deletedAt: null,
        ...where
      },
      orderBy: orderBy || { id: 'asc' }
    })

    // Map each KyNhan with unlocked field
    return allKyNhans.map((kyNhan) => ({
      ...kyNhan,
      unlocked: userKyNhanIds.has(kyNhan.id)
    }))
  }
}
