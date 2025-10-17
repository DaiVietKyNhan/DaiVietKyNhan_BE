import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateUserAnswerLogBodyType,
  UpdateUserAnswerLogBodyType,
  USERANSWERLOG_FIELDS,
  UserAnswerLogType
} from './entities/user-answerlog.entity'

@Injectable()
export class UserAnswerLogRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateUserAnswerLogBodyType & { isCorrect: boolean; userId }
  }): Promise<UserAnswerLogType> {
    return this.prismaService.userAnswerLog.create({
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
    data: UpdateUserAnswerLogBodyType
  }): Promise<UserAnswerLogType> {
    return this.prismaService.userAnswerLog.update({
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
  ): Promise<UserAnswerLogType> {
    return isHard
      ? this.prismaService.userAnswerLog.delete({
          where: {
            id
          }
        })
      : this.prismaService.userAnswerLog.update({
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
    const { where, orderBy } = parseQs(pagination.qs, USERANSWERLOG_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.userAnswerLog.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.userAnswerLog.findMany({
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

  findById(id: number): Promise<UserAnswerLogType | null> {
    return this.prismaService.userAnswerLog.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findByUserIdAndQuestionId(
    userId: number,
    questionId: number
  ): Promise<UserAnswerLogType | null> {
    return this.prismaService.userAnswerLog.findFirst({
      where: {
        userId,
        questionId,
        deletedAt: null
      }
    })
  }

  async createOrUpdate({
    userId,
    data,
    createdById
  }: {
    userId: number
    data: CreateUserAnswerLogBodyType & { isCorrect: boolean }
    createdById: number | null
  }): Promise<UserAnswerLogType> {
    // Check if record exists
    const existing = await this.findByUserIdAndQuestionId(userId, data.questionId)

    if (existing) {
      // Update existing record
      return this.prismaService.userAnswerLog.update({
        where: { id: existing.id },
        data: {
          text: data.text,
          isCorrect: data.isCorrect,
          updatedById: createdById
        }
      })
    } else {
      // Create new record
      return this.prismaService.userAnswerLog.create({
        data: {
          ...data,
          userId,
          createdById
        }
      })
    }
  }

  async isCorrectUserIdAndQuestionId(
    userId: number,
    questionId: number
  ): Promise<boolean> {
    const record = await this.prismaService.userAnswerLog.findFirst({
      where: {
        userId,
        questionId,
        deletedAt: null
      }
    })
    return record ? record.isCorrect : false
  }

  isExistUserIdAndQuestionId(userId: number, questionId: number): Promise<boolean> {
    return this.prismaService.userAnswerLog
      .count({
        where: {
          userId,
          questionId,
          deletedAt: null
        }
      })
      .then((count) => count > 0)
  }
}
