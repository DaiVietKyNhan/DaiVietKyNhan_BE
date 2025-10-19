import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

import { TestQuestionHomeAlreadyExistsException } from './dto/test-question-home.error'
import {
  CreateTestQuestionHomeBodyType,
  UpdateTestQuestionHomeBodyType
} from './entities/test-question-home.entity'
import { TestQuestionHomeRepo } from './test-question-home.repo'

@Injectable()
export class TestQuestionHomeService {
  constructor(private testQuestionHomeRepo: TestQuestionHomeRepo) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.testQuestionHomeRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async getListWithUser(userId: number) {
    const data = await this.testQuestionHomeRepo.getListWithUser(userId)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.testQuestionHomeRepo.findById(id)
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
    data: CreateTestQuestionHomeBodyType
    createdById: number
  }) {
    try {
      // check xem cau hoi co trung khong
      const isExistsQuestion = await this.testQuestionHomeRepo.findByQuestion(data.text)
      if (isExistsQuestion) {
        throw TestQuestionHomeAlreadyExistsException
      }
      const attendenceConfig = await this.testQuestionHomeRepo.create({
        createdById,
        data
      })
      return {
        statusCode: HttpStatus.CREATED,
        data: attendenceConfig,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw TestQuestionHomeAlreadyExistsException
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
    data: UpdateTestQuestionHomeBodyType
    updatedById: number
  }) {
    try {
      // check xem cau hoi co trung khong
      if (data.text) {
        const isExistsQuestion = await this.testQuestionHomeRepo.findByQuestion(data.text)
        if (isExistsQuestion && isExistsQuestion.id !== id) {
          throw TestQuestionHomeAlreadyExistsException
        }
      }

      const updatedTestQuestionHome = await this.testQuestionHomeRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedTestQuestionHome,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw TestQuestionHomeAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.testQuestionHomeRepo.delete({
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
      throw error
    }
  }
}
