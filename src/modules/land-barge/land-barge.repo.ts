import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateLandBargeBodyType,
  LAND_BARGE_PROFILE_FIELDS,
  LandBargeTypeType,
  UpdateLandBargeBodyType
} from './entities/land-barge.entity'

@Injectable()
export class LandBargeRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateLandBargeBodyType
  }): Promise<LandBargeTypeType> {
    return this.prismaService.landBarge.create({
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
    data: UpdateLandBargeBodyType
  }): Promise<LandBargeTypeType> {
    return this.prismaService.landBarge.update({
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
  ): Promise<LandBargeTypeType> {
    return isHard
      ? this.prismaService.landBarge.delete({
          where: {
            id
          }
        })
      : this.prismaService.landBarge.update({
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
    const { where, orderBy } = parseQs(pagination.qs, LAND_BARGE_PROFILE_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.landBarge.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.landBarge.findMany({
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

  findById(id: number): Promise<LandBargeTypeType | null> {
    return this.prismaService.landBarge.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findAll(): Promise<LandBargeTypeType[]> {
    return this.prismaService.landBarge.findMany({
      where: {
        deletedAt: null
      },
      orderBy: { id: 'asc' }
    })
  }
}
