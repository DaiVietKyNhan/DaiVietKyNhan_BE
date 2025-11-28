import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateRewardBodyType,
  REWARD_FIELDS,
  RewardType,
  UpdateRewardBodyType
} from './entities/reward.entity'

@Injectable()
export class RewardRepo {
  constructor(private prismaService: PrismaService) {}

  list(pagination: PaginationQueryType) {
    const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(
      pagination.qs,
      REWARD_FIELDS
    )
    const skip = (pagination.currentPage - 1) * pagination.pageSize

    return this.prismaService.reward.findMany({
      where: {
        ...parsedWhere,
        deletedAt: null
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
    data: CreateRewardBodyType
  }): Promise<RewardType> {
    return this.prismaService.reward.create({
      data: {
        ...data,
        createdById
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
    const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(
      pagination.qs,
      REWARD_FIELDS
    )
    const skip = (pagination.currentPage - 1) * pagination.pageSize

    return this.prismaService.reward.findMany({
      where: {
        ...parsedWhere,
        ...where,
        deletedAt: null
      },
      orderBy: parsedOrderBy || orderBy || { createdAt: 'desc' },
      skip,
      take: pagination.pageSize
    })
  }

  findManyCount({ where }: { where?: any }) {
    return this.prismaService.reward.count({
      where: {
        ...where,
        deletedAt: null
      }
    })
  }

  findUnique({ id }: { id: number }) {
    return this.prismaService.reward.findUnique({
      where: { id: Number(id) }
    })
  }

  findByCode({ code }: { code: string }) {
    return this.prismaService.reward.findUnique({
      where: { code }
    })
  }

  update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateRewardBodyType
    updatedById: number
  }) {
    return this.prismaService.reward.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedById
      }
    })
  }

  delete({ id, deletedById }: { id: number; deletedById: number }) {
    return this.prismaService.reward.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
        deletedById
      }
    })
  }

  findActiveRewards() {
    const now = new Date()
    return this.prismaService.reward.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  findByType(type: 'POINT' | 'COIN' | 'CODE') {
    const now = new Date()
    return this.prismaService.reward.findMany({
      where: {
        type,
        isActive: true,
        deletedAt: null,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  checkRewardAvailability({ id }: { id: number }) {
    const now = new Date()
    return this.prismaService.reward.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }]
          }
        ]
      }
    })
  }

  getSpecial5200(): Promise<RewardType | null> {
    return this.prismaService.reward.findFirst({
      where: {
        deletedAt: null,
        requireValue: 5200
      }
    })
  }
}
