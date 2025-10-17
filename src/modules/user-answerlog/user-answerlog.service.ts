import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isRecordNotFoundOnConnectPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { KyNhanSummaryRepo } from '../kynhan-summary/kynhan-summary.repo'
import { QuestionRepo } from '../question/question.repo'
import {
  UserAnswerLogAlreadyExistsException,
  UserAnswerLogIsCorrectExistExistsException
} from './dto/user-answerlog.error'
import { CreateUserAnswerLogBodyType } from './entities/user-answerlog.entity'
import { UserAnswerLogRepo } from './user-answerlog.repo'

@Injectable()
export class UserAnswerLogService {
  constructor(
    private userAnswerLogRepo: UserAnswerLogRepo,
    private readonly quesRepo: QuestionRepo,
    private readonly kyNhanSummaryRepo: KyNhanSummaryRepo,
    private readonly sharedUserRepo: SharedUserRepository
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.userAnswerLogRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const answer = await this.userAnswerLogRepo.findById(id)
    if (!answer) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: answer,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateUserAnswerLogBodyType
    createdById: number
  }) {
    try {
      //check coi người dùng đã trả lời đúng câu hỏi này chưa
      const isUserAnswerLogCorrect =
        await this.userAnswerLogRepo.isCorrectUserIdAndQuestionId(
          createdById,
          data.questionId
        )
      if (isUserAnswerLogCorrect) {
        throw UserAnswerLogIsCorrectExistExistsException
      }
      const isCorrect = await this.checkisCorrect({
        questionId: data.questionId,
        textAnswer: data.text
      })

      // Business: reward/punish user based on correctness
      if (isCorrect) {
        // 1) Attach related KyNhanSummaries and KyNhans to user
        const summaries = await this.kyNhanSummaryRepo.findByQuestionId(data.questionId)
        const summaryIds = (summaries ?? []).map((s) => s.id)
        if (summaryIds.length) {
          console.log('co kynhan summary: ', summaryIds)

          await this.sharedUserRepo.addKyNhanSummariesToUser(createdById, summaryIds)
          // Fetch KyNhan IDs from summaries
          const kynhanIds = Array.from(new Set((summaries ?? []).map((s) => s.kyNhanId)))
          if (kynhanIds.length) {
            await this.sharedUserRepo.addKynhansToUser(createdById, kynhanIds)
          }
        }
        // 2) Add points equal to question.point
        const question = await this.quesRepo.findById(data.questionId)
        if (question?.point) {
          await this.sharedUserRepo.addpointByUserId({
            userId: createdById,
            amount: question.point
          })
        }
      } else {
        // Incorrect: minus 20 points but not below zero
        // Get current point
        const user = await this.sharedUserRepo.findUnique({ id: createdById })
        const currentPoint = user?.point ?? 0
        const amount = Math.min(20, currentPoint)
        if (amount > 0) {
          await this.sharedUserRepo.minuspointByUserId({ userId: createdById, amount })
        }
      }

      const answer = await this.userAnswerLogRepo.createOrUpdate({
        userId: createdById,
        createdById,
        data: {
          ...data,
          isCorrect
        }
      })
      return {
        statusCode: HttpStatus.CREATED,
        data: answer,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAnswerLogAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isRecordNotFoundOnConnectPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.userAnswerLogRepo.delete({
        id,
        deletedById
      })
      return {
        statusCode: HttpStatus.OK,
        data: null,
        message: ENTITY_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAnswerLogAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async checkisCorrect({
    questionId,
    textAnswer
  }: {
    questionId: number
    textAnswer: string
  }) {
    const question = await this.quesRepo.findById(questionId)
    if (!question) {
      throw NotFoundRecordException
    }

    return (await this.quesRepo.getQuestionByIdAndAnswer(questionId, textAnswer))
      ? true
      : false
  }
}
