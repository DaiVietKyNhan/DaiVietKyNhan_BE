import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateMotaKyNhanBodyType,
  MOTAKYNHAN_FIELDS,
  MotaKyNhanType,
  UpdateMotaKyNhanBodyType
} from './entities/mo-ta-ky-nhan.entity'

@Injectable()
export class MotaKyNhanRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateMotaKyNhanBodyType
  }): Promise<MotaKyNhanType> {
    return this.prismaService.motaKyNhan.create({
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
    data: UpdateMotaKyNhanBodyType
  }): Promise<MotaKyNhanType> {
    return this.prismaService.motaKyNhan.update({
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
  ): Promise<MotaKyNhanType> {
    return isHard
      ? this.prismaService.motaKyNhan.delete({
          where: {
            id
          }
        })
      : this.prismaService.motaKyNhan.update({
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
    const { where, orderBy } = parseQs(pagination.qs, MOTAKYNHAN_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.motaKyNhan.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.motaKyNhan.findMany({
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

  findById(id: number): Promise<MotaKyNhanType | null> {
    return this.prismaService.motaKyNhan.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
  findByKyNhanId(id: number): Promise<MotaKyNhanType | null> {
    return this.prismaService.motaKyNhan.findUnique({
      where: {
        kyNhanId: id,
        deletedAt: null
      }
    })
  }
}
