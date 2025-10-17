import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  ANSWER_FIELDS,
  AnswerType,
  CreateAnswerBodyType,
  UpdateAnswerBodyType
} from './entities/answer.entity'

@Injectable()
export class AnswerRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateAnswerBodyType
  }): Promise<AnswerType> {
    return this.prismaService.answer.create({
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
    data: UpdateAnswerBodyType
  }): Promise<AnswerType> {
    return this.prismaService.answer.update({
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
  ): Promise<AnswerType> {
    return isHard
      ? this.prismaService.answer.delete({
          where: {
            id
          }
        })
      : this.prismaService.answer.update({
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
    const { where, orderBy } = parseQs(pagination.qs, ANSWER_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.answer.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.answer.findMany({
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

  findById(id: number): Promise<AnswerType | null> {
    return this.prismaService.answer.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  createMany({ data }: { data: CreateAnswerBodyType[] }): Promise<{ count: number }> {
    return this.prismaService.answer.createMany({
      data: data,
      skipDuplicates: true
    })
  }

  deleteManyByQuestionId(questionId: number): Promise<{ count: number }> {
    return this.prismaService.answer.deleteMany({
      where: {
        questionId: questionId
      }
    })
  }

  countByQuestionId(questionId: number): Promise<number> {
    return this.prismaService.answer.count({
      where: {
        questionId,
        deletedAt: null
      }
    })
  }
}
