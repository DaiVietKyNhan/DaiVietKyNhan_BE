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
import { AchievementCheckerService } from '../achievement/achievement-checker.service'
import { KyNhanSummaryRepo } from '../kynhan-summary/kynhan-summary.repo'
import { QuestionRepo } from '../question/question.repo'
import { UserLandRepo } from '../user-land/user-land.repo'
import {
  LandNotYetUnlockedException,
  UserAnswerLogAlreadyExistsException,
  UserAnswerLogIsCorrectExistExistsException,
  UserNotEnoughHeartException
} from './dto/user-answerlog.error'
import { PassUserAnswerLogBodyDTO } from './dto/user-answerlog.zod-dto'
import { CreateUserAnswerLogBodyType } from './entities/user-answerlog.entity'
import { UserAnswerLogRepo } from './user-answerlog.repo'

@Injectable()
export class UserAnswerLogService {
  constructor(
    private userAnswerLogRepo: UserAnswerLogRepo,
    private readonly quesRepo: QuestionRepo,
    private readonly kyNhanSummaryRepo: KyNhanSummaryRepo,
    private readonly sharedUserRepo: SharedUserRepository,
    private readonly userLandRepo: UserLandRepo,

    private readonly achievementCheckerService: AchievementCheckerService
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
      let landId = 0
      //check xem user da tra loi cau hoi chua
      const isHave = await this.userAnswerLogRepo.checkHasAnswered(
        data.questionId,
        createdById
      )
      if (isHave) {
        // laasu user check tim ===0 khi cut
        const user = await this.sharedUserRepo.findUnique({ id: createdById })
        if (!user || user.heart < 1) {
          throw UserNotEnoughHeartException
        }
      }

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
          await this.sharedUserRepo.addKyNhanSummariesToUser(createdById, summaryIds)
          // Fetch KyNhan IDs from summaries
          const kynhanIds = Array.from(new Set((summaries ?? []).map((s) => s.kyNhanId)))
          if (kynhanIds.length) {
            await this.sharedUserRepo.addKynhansToUser(createdById, kynhanIds)
          }
        }
        // 2) Add points equal to question.point
        const question = await this.quesRepo.findById(data.questionId)
        if (!question) throw NotFoundRecordException
        if (question?.point) {
          await this.sharedUserRepo.addpointByUserId({
            userId: createdById,
            amount: question.point
          })
        }
        
        landId = question?.landId
        
        // 3) Check achievements after adding KyNhanSummary
        await this.achievementCheckerService.checkKyNhanSummaryAchievements(createdById)
      } else {
        // Incorrect: minus 20 points but not below zero
        // Get current point
        const user = await this.sharedUserRepo.findUnique({ id: createdById })
        const currentPoint = user?.point ?? 0
        const amount = Math.min(20, currentPoint)
        if (amount > 0) {
          await this.sharedUserRepo.minuspointByUserId({ userId: createdById, amount })
        }
        // muinus 1 heart
        await this.sharedUserRepo.minusHeart({ userId: createdById, amount: 1 })
      }

      const answer = await this.userAnswerLogRepo.createOrUpdate({
        userId: createdById,
        createdById,
        data: {
          ...data,
          isCorrect
        }
      })
      let isCompletedLand = false
      if (isCorrect) {
        isCompletedLand =
          await this.userAnswerLogRepo.isCompleteAllQuestionsInLandByUserId({
            landId: landId,
            userId: createdById
          })

        if (isCompletedLand) {
          isCompletedLand = true
          await this.setLandCompletedByUserId({
            landId,
            userId: createdById
          })
        }
      }
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          ...answer,
          isCompletedLand
        },
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

  async pass({
    data,
    createdById
  }: {
    data: PassUserAnswerLogBodyDTO
    createdById: number
  }) {
    try {
      //check xem user da tra loi cau hoi chua
      const isUserAnswerLogCorrect =
        await this.userAnswerLogRepo.isCorrectUserIdAndQuestionId(
          createdById,
          data.questionId
        )
      if (isUserAnswerLogCorrect) {
        throw UserAnswerLogIsCorrectExistExistsException
      }

      // lay user check point va tru point
      const user = await this.sharedUserRepo.findUnique({ id: createdById })
      if (!user) {
        throw NotFoundRecordException
      }

      if (user.point < 500) {
        throw UserNotEnoughHeartException
      }
      await this.sharedUserRepo.minuspointByUserId({ userId: createdById, amount: 500 })

      // lấy câu hỏi kèm câu trả lời
      const quesWithAns = await this.quesRepo.getQuestionsByIdWithAnswer(data.questionId)
      if (!quesWithAns) {
        throw NotFoundRecordException
      }
      const text = quesWithAns.answers[0]?.text || 'true'

      // Business: reward/punish user based on correctness
      if (true) {
        // 1) Attach related KyNhanSummaries and KyNhans to user
        const summaries = await this.kyNhanSummaryRepo.findByQuestionId(data.questionId)
        const summaryIds = (summaries ?? []).map((s) => s.id)
        if (summaryIds.length) {
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

        //KUMO
        // 3) Check achievements after adding KyNhanSummary
        // await this.achievementCheckerService.checkKyNhanSummaryAchievements(createdById)
      }

      const answer = await this.userAnswerLogRepo.createOrUpdate({
        userId: createdById,
        createdById,
        data: {
          ...data,
          text,
          isCorrect: true
        }
      })
      const landId = quesWithAns.landId
      const isCompletedLand =
        await this.userAnswerLogRepo.isCompleteAllQuestionsInLandByUserId({
          landId: landId,
          userId: createdById
        })
      if (isCompletedLand) {
        await this.setLandCompletedByUserId({
          landId,
          userId: createdById
        })
      }
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          ...answer,
          isCompletedLand
        },
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

  async checkHasAnswered({ questionId, userId }: { questionId: number; userId: number }) {
    const isHave = await this.userAnswerLogRepo.checkHasAnswered(questionId, userId)

    return {
      statusCode: HttpStatus.OK,
      data: isHave,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async isCompleteAllQuestionsInLandByUserId({
    landId,
    userId
  }: {
    landId: number
    userId: number
  }) {
    return this.userAnswerLogRepo.isCompleteAllQuestionsInLandByUserId({ landId, userId })
  }

  async setLandCompletedByUserId({ landId, userId }: { landId: number; userId: number }) {
    // Get all user lands ordered by id (assumes land order)
    const landsUser = await this.userLandRepo.getLandsByUserId(userId)

    // Find the index of the current land being completed
    const currentIndex = landsUser.findIndex((ul) => ul.landId === landId)
    if (currentIndex === -1) {
      throw NotFoundRecordException
    }

    const currentLand = landsUser[currentIndex]

    // Set current land to COMPLETED
    await this.userLandRepo.update({
      id: currentLand.id,
      updatedById: userId,
      data: { status: 'COMPLETED' }
    })

    // Handle next land progression
    if (currentIndex + 1 < landsUser.length) {
      const nextLand = landsUser[currentIndex + 1]

      if (nextLand.status === 'LOCKED_FORCED') {
        // Throw error: not yet time to unlock
        throw LandNotYetUnlockedException
      } else if (nextLand.status === 'LOCKED') {
        // Update to PENDING
        await this.userLandRepo.update({
          id: nextLand.id,
          updatedById: userId,
          data: { status: 'PENDING' }
        })
      }
      // If already PENDING or COMPLETED, do nothing
    }

    return
  }
}
