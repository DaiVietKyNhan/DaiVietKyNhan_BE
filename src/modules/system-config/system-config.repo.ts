import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateSystemConfigBodyType,
  SYSTEM_CONFIG_FIELDS,
  SystemConfigType,
  UpdateSystemConfigBodyType
} from './entities/system-config.entity'

@Injectable()
export class SystemConfigRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateSystemConfigBodyType
  }): Promise<SystemConfigType> {
    return this.prismaService.systemConfig.create({
      data: {
        ...data,
        createdById,
        deletedAt: null
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
    data: UpdateSystemConfigBodyType
  }): Promise<SystemConfigType> {
    return this.prismaService.systemConfig.update({
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
  ): Promise<SystemConfigType> {
    return isHard
      ? this.prismaService.systemConfig.delete({
          where: {
            id
          }
        })
      : this.prismaService.systemConfig.update({
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
    const { where, orderBy } = parseQs(pagination.qs, SYSTEM_CONFIG_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.systemConfig.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.systemConfig.findMany({
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

  findById(id: number): Promise<SystemConfigType | null> {
    return this.prismaService.systemConfig.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
