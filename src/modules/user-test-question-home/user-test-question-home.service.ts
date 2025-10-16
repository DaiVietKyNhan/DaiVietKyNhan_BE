import { ANSWER_SCALE_MESSAGE, ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'

import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { UserTestQuestionHomeAlreadyExistsException } from './dto/user-test-question-home.error'
import {
  CreateUserTestQuestionHomeBodyType,
  UpdateUserTestQuestionHomeBodyType,
  UserTestQuestionHomeTypeType
} from './entities/user-test-question-home.entity'
import { UserTestQuestionHomeRepo } from './user-test-question-home.repo'

@Injectable()
export class UserTestQuestionHomeService {
  constructor(
    private userTestQuestionHomeRepo: UserTestQuestionHomeRepo,
    private readonly sharedUserRepo: SharedUserRepository
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.userTestQuestionHomeRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.userTestQuestionHomeRepo.findById(id)
    if (!attendenceConfig) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: attendenceConfig,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateUserTestQuestionHomeBodyType
    createdById: number
  }) {
    try {
      // check xem da tra loi cau nay chua
      const isExistsQuestion =
        await this.userTestQuestionHomeRepo.findByUserIdAndQuestion(
          createdById,
          data.questionId
        )

      // tra loi roi thi update thay vi tao moi
      let attendenceConfig: UserTestQuestionHomeTypeType
      if (isExistsQuestion) {
        attendenceConfig = await this.userTestQuestionHomeRepo.update({
          id: isExistsQuestion.id,
          data,
          updatedById: createdById
        })
      } else {
        attendenceConfig = await this.userTestQuestionHomeRepo.create({
          createdById,
          data: {
            ...data,
            userId: createdById
          }
        })
      }

      //xem day co phai la cau hoi cuoi cung khong neu phai thi cap nhat da hoan thanh test
      const isLastQuestion =
        await this.userTestQuestionHomeRepo.checkIsLastQuestion(createdById)

      let pointHome = 0

      if (isLastQuestion) {
        const listAnswer =
          await this.userTestQuestionHomeRepo.getListAnswerByUserIdWithQuestion(
            createdById
          )

        await this.sharedUserRepo.updateUserPointHome(createdById, true)
      }
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          ...attendenceConfig,
          pointHome: isLastQuestion ? true : false
        },
        message: ANSWER_SCALE_MESSAGE.ANSWER_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw UserTestQuestionHomeAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isNotFoundPrismaError(error)) {
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
    data: UpdateUserTestQuestionHomeBodyType
    updatedById: number
  }) {
    try {
      const updatedUserTestQuestionHome = await this.userTestQuestionHomeRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedUserTestQuestionHome,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.userTestQuestionHomeRepo.delete({
        id,
        deletedById
      })
      return {
        statusCode: HttpStatus.OK,
        data: null,
        message: ENTITY_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
