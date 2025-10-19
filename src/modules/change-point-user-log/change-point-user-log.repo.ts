import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { NotFoundRecordException } from '@/shared/error'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CHANGE_POINT_USER_LOG_FIELDS,
  ChangePointUserLogType,
  CreateChangePointUserLogBodyType,
  UpdateChangePointUserLogBodyType
} from './entities/change-point-user-log.entity'

@Injectable()
export class ChangePointUserLogRepo {
  constructor(private prismaService: PrismaService) {}

  async create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateChangePointUserLogBodyType
  }): Promise<ChangePointUserLogType> {
    const { userId, reason, newPoint, newCoin, newHeart } = data

    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { point: true, coin: true, heart: true }
      })

      if (!user) throw NotFoundRecordException

      const snapshotPoint = user.point ?? 0
      const snapshotCoin = user.coin ?? 0
      const snapshotHeart = user.heart ?? 0

      await tx.user.update({
        where: { id: userId, deletedAt: null },
        data: {
          point: newPoint,
          coin: newCoin,
          heart: newHeart
        }
      })

      const created = await tx.changePointUserLog.create({
        data: {
          userId,
          reason,
          newPoint,
          snapshotPoint,
          newCoin,
          snapshotCoin,
          newHeart,
          snapshotHeart,
          createdById
        }
      })

      return created
    })
  }

  async update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateChangePointUserLogBodyType
  }): Promise<ChangePointUserLogType> {
    return this.prismaService.$transaction(async (tx) => {
      const existing = await tx.changePointUserLog.findFirst({
        where: { id, deletedAt: null }
      })
      if (!existing) throw NotFoundRecordException

      const { reason, newPoint, newCoin, newHeart } = data as any

      const user = await tx.user.findFirst({
        where: { id: existing.userId, deletedAt: null },
        select: { point: true, coin: true, heart: true }
      })
      if (!user) throw NotFoundRecordException

      const snapshotPoint = user.point ?? 0
      const snapshotCoin = user.coin ?? 0
      const snapshotHeart = user.heart ?? 0

      const userUpdate: any = {}
      if (typeof newPoint === 'number') userUpdate.point = newPoint
      if (typeof newCoin === 'number') userUpdate.coin = newCoin
      if (typeof newHeart === 'number') userUpdate.heart = newHeart

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: existing.userId, deletedAt: null },
          data: userUpdate
        })
      }

      const updated = await tx.changePointUserLog.update({
        where: { id, deletedAt: null },
        data: {
          ...(reason !== undefined ? { reason } : {}),
          ...(newPoint !== undefined ? { newPoint } : {}),
          ...(newCoin !== undefined ? { newCoin } : {}),
          ...(newHeart !== undefined ? { newHeart } : {}),
          ...(newPoint !== undefined ? { snapshotPoint } : {}),
          ...(newCoin !== undefined ? { snapshotCoin } : {}),
          ...(newHeart !== undefined ? { snapshotHeart } : {}),
          updatedById
        }
      })

      return updated
    })
  }

  async delete(
    { id, deletedById }: { id: number; deletedById: number },
    isHard = false
  ): Promise<ChangePointUserLogType> {
    if (isHard) {
      return this.prismaService.changePointUserLog.delete({ where: { id } })
    }

    return this.prismaService.changePointUserLog.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById }
    })
  }

  async list(pagination: PaginationQueryType) {
    const { where, orderBy } = parseQs(pagination.qs, CHANGE_POINT_USER_LOG_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.changePointUserLog.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.changePointUserLog.findMany({
        where: { deletedAt: null, ...where },
        include: {
          user: true
        },
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

  async findById(id: number): Promise<ChangePointUserLogType | null> {
    return this.prismaService.changePointUserLog.findFirst({
      where: { id, deletedAt: null }
    })
  }
}
