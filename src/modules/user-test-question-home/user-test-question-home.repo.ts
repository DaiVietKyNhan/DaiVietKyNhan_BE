import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'

import {
  CreateUserTestQuestionHomeBodyType,
  UpdateUserTestQuestionHomeBodyType,
  USER_TEST_QUESTION_HOME_FIELDS,
  UserTestQuestionHomeTypeType,
  UserTestQuestionHomeWithQuestionType
} from './entities/user-test-question-home.entity'

@Injectable()
export class UserTestQuestionHomeRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateUserTestQuestionHomeBodyType & { userId: number }
  }): Promise<UserTestQuestionHomeTypeType> {
    return this.prismaService.userTestQuestionHome.create({
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
    data: UpdateUserTestQuestionHomeBodyType
  }): Promise<UserTestQuestionHomeTypeType> {
    return this.prismaService.userTestQuestionHome.update({
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
  ): Promise<UserTestQuestionHomeTypeType> {
    return isHard
      ? this.prismaService.userTestQuestionHome.delete({
          where: {
            id
          }
        })
      : this.prismaService.userTestQuestionHome.update({
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
    const { where, orderBy } = parseQs(pagination.qs, USER_TEST_QUESTION_HOME_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.userTestQuestionHome.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.userTestQuestionHome.findMany({
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

  findById(id: number): Promise<UserTestQuestionHomeTypeType | null> {
    return this.prismaService.userTestQuestionHome.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findByUserIdAndQuestion(
    userId: number,
    questionId: number
  ): Promise<UserTestQuestionHomeTypeType | null> {
    return this.prismaService.userTestQuestionHome.findFirst({
      where: {
        userId,
        questionId,
        deletedAt: null
      }
    })
  }

  async checkIsLastQuestion(userId: number): Promise<boolean> {
    const result = await this.prismaService.$queryRawUnsafe<
      { isLastQuestion: boolean }[]
    >(`
    SELECT
      CASE
        WHEN (
          SELECT COUNT(DISTINCT uth."questionId")
          FROM "UserTestQuestionHome" uth
          WHERE uth."userId" = ${userId} AND uth."deletedAt" IS NULL
        ) = (
          SELECT COUNT(*) FROM "TestQuestionHome" th
          WHERE th."deletedAt" IS NULL
        )
        THEN TRUE
        ELSE FALSE
      END AS "isLastQuestion";
  `)

    return result[0]?.isLastQuestion ?? false
  }
  getListAnswerByUserIdWithQuestion(
    userId: number
  ): Promise<UserTestQuestionHomeWithQuestionType[]> {
    return this.prismaService.userTestQuestionHome.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        question: true
      }
    })
  }
}
