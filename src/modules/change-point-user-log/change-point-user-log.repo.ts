import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
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

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateChangePointUserLogBodyType
  }): Promise<ChangePointUserLogType> {
    const { userId, reason, newPoint, newCoin, newHeart } = data

    // Transaction: update User fields then create log
    return this.prismaService.$transaction(async (tx) => {
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
          newCoin,
          newHeart,
          createdById
        }
      })

      return created
    })
  }

  update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateChangePointUserLogBodyType
  }): Promise<ChangePointUserLogType> {
    // Transaction: fetch existing to ensure userId unchanged; update user with provided fields; update log
    return this.prismaService.$transaction(async (tx) => {
      const existing = await tx.changePointUserLog.findUnique({
        where: { id, deletedAt: null }
      })
      if (!existing) {
        // Prisma will throw NotFound if we try to update non-existent; but for clarity:
        throw new Error('RECORD_NOT_FOUND')
      }

      const { reason, newPoint, newCoin, newHeart } = data

      // Update user with only provided fields
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
        where: {
          id,
          deletedAt: null
        },
        data: {
          ...(reason !== undefined ? { reason } : {}),
          ...(newPoint !== undefined ? { newPoint } : {}),
          ...(newCoin !== undefined ? { newCoin } : {}),
          ...(newHeart !== undefined ? { newHeart } : {}),
          updatedById
        }
      })

      return updated
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
  ): Promise<ChangePointUserLogType> {
    return isHard
      ? this.prismaService.changePointUserLog.delete({
          where: {
            id
          }
        })
      : this.prismaService.changePointUserLog.update({
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
    const { where, orderBy } = parseQs(pagination.qs, CHANGE_POINT_USER_LOG_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.changePointUserLog.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.changePointUserLog.findMany({
        where: { deletedAt: null, ...where },
        include: { user: true },
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

  findById(id: number): Promise<ChangePointUserLogType | null> {
    return this.prismaService.changePointUserLog.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
