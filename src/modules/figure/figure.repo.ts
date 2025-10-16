import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'

import {
  CreateFigureBodyType,
  FIGURE_FIELDS,
  FigureTypeType,
  UpdateFigureBodyType
} from './entities/figure.entity'

@Injectable()
export class FigureRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateFigureBodyType
  }): Promise<FigureTypeType> {
    return this.prismaService.figure.create({
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
    data: UpdateFigureBodyType
  }): Promise<FigureTypeType> {
    return this.prismaService.figure.update({
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
  ): Promise<FigureTypeType> {
    return isHard
      ? this.prismaService.figure.delete({
          where: {
            id
          }
        })
      : this.prismaService.figure.update({
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
    const { where, orderBy } = parseQs(pagination.qs, FIGURE_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.figure.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.figure.findMany({
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

  findById(id: number): Promise<FigureTypeType | null> {
    return this.prismaService.figure.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
