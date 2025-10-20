import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateLandBodyType,
  LAND_FIELDS,
  LandType,
  LandWithQuestionAndUserAnswerLogType,
  UpdateLandBodyType
} from './entities/land.entity'

@Injectable()
export class LandRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateLandBodyType
  }): Promise<LandType> {
    return this.prismaService.land.create({
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
    data: UpdateLandBodyType
  }): Promise<LandType> {
    return this.prismaService.land.update({
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
  ): Promise<LandType> {
    return isHard
      ? this.prismaService.land.delete({
          where: {
            id
          }
        })
      : this.prismaService.land.update({
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
    const { where, orderBy } = parseQs(pagination.qs, LAND_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.land.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.land.findMany({
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

  findById(id: number): Promise<LandType | null> {
    return this.prismaService.land.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findExistByName(name: string): Promise<LandType | null> {
    return this.prismaService.land.findFirst({
      where: {
        name,
        deletedAt: null
      }
    })
  }

  findAll(): Promise<LandType[]> {
    return this.prismaService.land.findMany({
      where: {
        deletedAt: null
      },
      orderBy: { id: 'asc' }
    })
  }

  getListQuesByLandId(landId: number): Promise<LandType | null> {
    return this.prismaService.land.findUnique({
      where: {
        id: landId,
        deletedAt: null
      },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            answers: true
          }
        }
      }
    })
  }

  getQuestionsByLandId(
    landId: number,
    userId: number
  ): Promise<LandWithQuestionAndUserAnswerLogType | null> {
    return this.prismaService.land.findUnique({
      where: {
        id: landId,
        deletedAt: null
      },
      include: {
        questions: {
          where: { deletedAt: null },
          select: {
            id: true,
            text: true,
            questionType: true,
            answerOptionType: true,
            userAnswerLogs: {
              where: {
                userId,
                deletedAt: null
              },
              select: {
                id: true,
                text: true,
                isCorrect: true
              }
            },
            kynhanSummaries: {
              select: {
                id: true,
                summary: true,
                kyNhanId: true,
                imgUrl: true
              }
            }
          },
          orderBy: { id: 'asc' }
        }
      }
    })
  }
}
