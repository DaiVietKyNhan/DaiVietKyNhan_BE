import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'

import {
  CreateTestQuestionHomeBodyType,
  TEST_QUESTION_HOME_FIELDS,
  TestQuestionHomeTypeType,
  UpdateTestQuestionHomeBodyType
} from './entities/test-question-home.entity'

@Injectable()
export class TestQuestionHomeRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateTestQuestionHomeBodyType
  }): Promise<TestQuestionHomeTypeType> {
    return this.prismaService.testQuestionHome.create({
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
    data: UpdateTestQuestionHomeBodyType
  }): Promise<TestQuestionHomeTypeType> {
    return this.prismaService.testQuestionHome.update({
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
  ): Promise<TestQuestionHomeTypeType> {
    return isHard
      ? this.prismaService.testQuestionHome.delete({
          where: {
            id
          }
        })
      : this.prismaService.testQuestionHome.update({
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
    const { where, orderBy } = parseQs(pagination.qs, TEST_QUESTION_HOME_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.testQuestionHome.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.testQuestionHome.findMany({
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

  findById(id: number): Promise<TestQuestionHomeTypeType | null> {
    return this.prismaService.testQuestionHome.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findByQuestion(text: string): Promise<TestQuestionHomeTypeType | null> {
    return this.prismaService.testQuestionHome.findFirst({
      where: {
        text,
        deletedAt: null
      }
    })
  }
}
