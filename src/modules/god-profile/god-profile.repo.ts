import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateGodProfileBodyType,
  GOD_PROFILE_FIELDS,
  GodProfileTypeType,
  UpdateGodProfileBodyType
} from './entities/god-profile.entity'

@Injectable()
export class GodProfileRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateGodProfileBodyType
  }): Promise<GodProfileTypeType> {
    return this.prismaService.godProfile.create({
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
    data: UpdateGodProfileBodyType
  }): Promise<GodProfileTypeType> {
    return this.prismaService.godProfile.update({
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
  ): Promise<GodProfileTypeType> {
    return isHard
      ? this.prismaService.godProfile.delete({
          where: {
            id
          }
        })
      : this.prismaService.godProfile.update({
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
    const { where, orderBy } = parseQs(pagination.qs, GOD_PROFILE_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.godProfile.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.godProfile.findMany({
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

  findById(id: number): Promise<GodProfileTypeType | null> {
    return this.prismaService.godProfile.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findListGodByPoint(point: number): Promise<GodProfileTypeType[]> {
    return this.prismaService.godProfile.findMany({
      where: {
        order: {
          lte: point
        },
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
  }

  findAll(): Promise<GodProfileTypeType[]> {
    return this.prismaService.godProfile.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
  }
}
