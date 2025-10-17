import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateQuestionBodyType,
  QUESTION_FIELDS,
  QuestionType,
  QuestionWithAnswersType,
  UpdateQuestionBodyType
} from './entities/question.entity'

@Injectable()
export class QuestionRepo {
  constructor(private prismaService: PrismaService) {}

  // Helper: Disconnect kynhanSummaries from all other questions
  async disconnectKynhanSummariesFromOtherQuestions(
    kynhanSummaryIds: number[],
    excludeQuestionId?: number
  ): Promise<void> {
    if (!kynhanSummaryIds || kynhanSummaryIds.length === 0) return

    await this.prismaService.kyNhanSummary.updateMany({
      where: {
        id: { in: kynhanSummaryIds },
        ...(excludeQuestionId ? { questionId: { not: excludeQuestionId } } : {})
      },
      data: {
        questionId: null
      }
    })
  }

  async create({
    createdById,
    data
  }: {
    createdById: number | null
    data: Omit<CreateQuestionBodyType, 'answers'>
  }): Promise<QuestionType> {
    // Double-omit answers for safety
    const { answers, ...rest } = data as any

    // Disconnect kynhanSummaries from all other questions before creating
    if (rest.kynhanSummaries && rest.kynhanSummaries.length > 0) {
      await this.disconnectKynhanSummariesFromOtherQuestions(rest.kynhanSummaries)
    }

    return this.prismaService.question.create({
      data: {
        ...rest,
        createdById,
        kynhanSummaries: {
          connect: rest.kynhanSummaries.map((id) => ({ id }))
        }
      }
    })
  }

  async update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: Omit<UpdateQuestionBodyType, 'answers'>
  }): Promise<QuestionType> {
    const { kynhanSummaries, ...rest } = data

    // If kynhanSummaries provided, disconnect them from other questions first
    if (kynhanSummaries && kynhanSummaries.length > 0) {
      await this.disconnectKynhanSummariesFromOtherQuestions(kynhanSummaries, id)
    }

    return this.prismaService.question.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...rest,
        updatedById,
        ...(kynhanSummaries
          ? {
              // Nếu có truyền kynhanSummaries
              kynhanSummaries: {
                set: kynhanSummaries.map((id) => ({ id })) // ✅ thay toàn bộ danh sách
              }
            }
          : {}) // Nếu không truyền, Prisma sẽ bỏ qua, giữ nguyên danh sách cũ
      }
    })
  }

  async delete(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<QuestionType> {
    // Disconnect all kynhanSummaries from this question before deleting
    await this.prismaService.kyNhanSummary.updateMany({
      where: { questionId: id },
      data: { questionId: null }
    })

    return isHard
      ? this.prismaService.question.delete({
          where: {
            id
          }
        })
      : this.prismaService.question.update({
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
    const { where, orderBy } = parseQs(pagination.qs, QUESTION_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.question.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.question.findMany({
        where: { deletedAt: null, ...where },
        include: { kynhanSummaries: true, answers: true },

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

  findById(id: number): Promise<QuestionType | null> {
    return this.prismaService.question.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
  findByText(text: string): Promise<QuestionType | null> {
    return this.prismaService.question.findFirst({
      where: {
        text,
        deletedAt: null
      }
    })
  }
  isMaxQuestionPerLandExceeded(landId: number, currentCount: number): Promise<boolean> {
    return this.prismaService.question
      .count({
        where: {
          landId,
          deletedAt: null
        }
      })
      .then((count) => count >= currentCount)
  }

  getQuestionsByLandId(landId: number): Promise<QuestionType[]> {
    return this.prismaService.question.findMany({
      where: {
        landId,
        deletedAt: null
      },
      include: { kynhanSummaries: true, answers: true }
    })
  }

  getQuestionByIdAndAnswer(
    questionId: number,
    text: string
  ): Promise<QuestionType | null> {
    return this.prismaService.question.findFirst({
      where: {
        id: questionId,
        deletedAt: null,
        answers: {
          some: {
            text: {
              equals: text,
              mode: 'insensitive' // không phân biệt hoa thường
            }
          }
        }
      },
      include: {
        answers: true
      }
    })
  }

  getQuestionsByIdWithAnswer(id: number): Promise<QuestionWithAnswersType | null> {
    return this.prismaService.question.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        answers: true
      }
    })
  }
}
