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
    return this.prismaService.changePointUserLog.create({
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
    data: UpdateChangePointUserLogBodyType
  }): Promise<ChangePointUserLogType> {
    return this.prismaService.changePointUserLog.update({
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

  createMany({
    data
  }: {
    data: CreateChangePointUserLogBodyType[]
  }): Promise<{ count: number }> {
    return this.prismaService.changePointUserLog.createMany({
      data: data,
      skipDuplicates: true
    })
  }
}
