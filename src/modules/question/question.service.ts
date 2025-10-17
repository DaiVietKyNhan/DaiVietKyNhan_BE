import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isRecordNotFoundOnConnectPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { AnswerRepo } from '../answer/answer.repo'
import { MaxAnswerPerQuestionExceededException } from '../answer/dto/answer.error'
import { CreateAnswerBodyType } from '../answer/entities/answer.entity'
import { LandRepo } from '../land/land.repo'
import {
  MaxQuestionPerLandExceededException,
  QuestionAlreadyExistsException
} from './dto/question.error'
import {
  CreateQuestionBodyType,
  UpdateQuestionBodyType
} from './entities/question.entity'
import { QuestionRepo } from './question.repo'

@Injectable()
export class QuestionService {
  constructor(
    private questionRepo: QuestionRepo,
    private readonly answerRepo: AnswerRepo,
    private readonly landRepo: LandRepo
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.questionRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const question = await this.questionRepo.findById(id)
    if (!question) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: question,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateQuestionBodyType
    createdById: number
  }) {
    try {
      const land = await this.landRepo.findById(data.landId)
      const isMaxQuestionPerLandExceeded =
        await this.questionRepo.isMaxQuestionPerLandExceeded(
          data.landId,
          land?.totalQuestion || 0
        )
      if (isMaxQuestionPerLandExceeded) {
        throw MaxQuestionPerLandExceededException
      }

      const isExistQuesByText = await this.questionRepo.findByText(data.text)
      if (isExistQuesByText) {
        throw QuestionAlreadyExistsException
      }

      if (data.answers.length > 1 && !data.allowSimilarAnswers) {
        throw MaxAnswerPerQuestionExceededException
      }
      const { answers, ...rest } = data
      const dataQuestion: Omit<CreateQuestionBodyType, 'answers'> = {
        ...rest
      }
      const question = await this.questionRepo.create({
        createdById,
        data: dataQuestion
      })
      // tao ok -> create answers
      const dataAnswer: CreateAnswerBodyType[] = data.answers.map((answer) => ({
        text: answer,
        questionId: question.id
      }))

      answers.length && (await this.answerRepo.createMany({ data: dataAnswer }))

      return {
        statusCode: HttpStatus.CREATED,
        data: question,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw QuestionAlreadyExistsException
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

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateQuestionBodyType
    updatedById: number
  }) {
    try {
      // 0) Load current question to compare allowSimilarAnswers and know current answers count
      const current = await this.questionRepo.findById(id)
      if (!current) {
        throw NotFoundRecordException
      }

      // 1) Enforce rules regarding allowSimilarAnswers and answers payload
      const allowSimilarChanged =
        typeof data.allowSimilarAnswers !== 'undefined' &&
        data.allowSimilarAnswers !== current.allowSimilarAnswers

      // If allowSimilarAnswers changed
      if (allowSimilarChanged) {
        // If client also sends answers with the change
        if (Array.isArray((data as any).answers)) {
          const answers = (data as any).answers as string[]
          if (answers.length === 1) {
            // proceed: we'll replace existing answers with the single one
          } else if (answers.length > 1) {
            // not allowed when toggling allowSimilarAnswers
            throw MaxAnswerPerQuestionExceededException
          }
        } else {
          // No answers sent. We must check current answers count; if > 1 then not allowed to toggle
          const currentCount = await this.answerRepo.countByQuestionId(id)
          if (currentCount > 1) {
            throw MaxAnswerPerQuestionExceededException
          }
        }
      }

      // 2) If answers provided, always replace old with new
      let willReplaceAnswers = false
      let newAnswers: string[] = []
      if (Array.isArray((data as any).answers)) {
        newAnswers = (data as any).answers as string[]

        // If allowSimilarAnswers is false (either unchanged false or being set to false), ensure only a single answer
        const effectiveAllowSimilar =
          typeof data.allowSimilarAnswers === 'boolean'
            ? data.allowSimilarAnswers
            : current.allowSimilarAnswers

        if (!effectiveAllowSimilar && newAnswers.length > 1) {
          throw MaxAnswerPerQuestionExceededException
        }
        willReplaceAnswers = true
      }

      // 3) Persist question main fields (excluding 'answers')
      const { answers: _ignored, ...rest } = data as any
      const updatedQuestion = await this.questionRepo.update({
        id,
        updatedById,
        data: rest
      })

      // 4) If we need to replace answers
      if (willReplaceAnswers) {
        await this.answerRepo.deleteManyByQuestionId(id)

        if (newAnswers.length > 0) {
          const dataAnswer: CreateAnswerBodyType[] = newAnswers.map((answer) => ({
            text: answer,
            questionId: id
          }))
          await this.answerRepo.createMany({ data: dataAnswer })
        }
      }

      return {
        statusCode: HttpStatus.OK,
        data: updatedQuestion,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw QuestionAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.questionRepo.delete({
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
        throw QuestionAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
