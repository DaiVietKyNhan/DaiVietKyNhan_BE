import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateKyNhanSummaryBodyType,
  GOD_PROFILE_FIELDS,
  KyNhanSummaryTypeType,
  UpdateKyNhanSummaryBodyType
} from './entities/kynhan-summary.entity'

@Injectable()
export class KyNhanSummaryRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateKyNhanSummaryBodyType
  }): Promise<KyNhanSummaryTypeType> {
    return this.prismaService.kyNhanSummary.create({
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
    data: UpdateKyNhanSummaryBodyType
  }): Promise<KyNhanSummaryTypeType> {
    return this.prismaService.kyNhanSummary.update({
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
  ): Promise<KyNhanSummaryTypeType> {
    return isHard
      ? this.prismaService.kyNhanSummary.delete({
          where: {
            id
          }
        })
      : this.prismaService.kyNhanSummary.update({
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
      this.prismaService.kyNhanSummary.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.kyNhanSummary.findMany({
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

  findById(id: number): Promise<KyNhanSummaryTypeType | null> {
    return this.prismaService.kyNhanSummary.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findByQuestionId(questionId: number): Promise<KyNhanSummaryTypeType[] | null> {
    return this.prismaService.kyNhanSummary.findMany({
      where: {
        questionId,
        deletedAt: null
      }
    })
  }

  async findByLandId(landId: number): Promise<KyNhanSummaryTypeType[]> {
    // First, get all kyNhanIds in the land
    const kyNhans = await this.prismaService.kyNhan.findMany({
      where: {
        landId,
        deletedAt: null
      },
      select: {
        id: true
      }
    })

    const kyNhanIds = kyNhans.map((kn) => kn.id)

    // Then, get all KyNhanSummary with those kyNhanIds
    return this.prismaService.kyNhanSummary.findMany({
      where: {
        kyNhanId: {
          in: kyNhanIds
        },
        deletedAt: null
      }
    })
  }
}
