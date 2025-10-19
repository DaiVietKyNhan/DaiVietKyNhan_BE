import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isRecordNotFoundOnConnectPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { ChangePointUserLogRepo } from './change-point-user-log.repo'
import { ChangePointUserLogAlreadyExistsException } from './dto/change-point-user-log.error'
import {
  CreateChangePointUserLogBodyType,
  UpdateChangePointUserLogBodyType
} from './entities/change-point-user-log.entity'

@Injectable()
export class ChangePointUserLogService {
  constructor(private ChangePointUserLogRepo: ChangePointUserLogRepo) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.ChangePointUserLogRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const ChangePointUserLog = await this.ChangePointUserLogRepo.findById(id)
    if (!ChangePointUserLog) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: ChangePointUserLog,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateChangePointUserLogBodyType
    createdById: number
  }) {
    try {
      const ChangePointUserLog = await this.ChangePointUserLogRepo.create({
        createdById,
        data
      })
      return {
        statusCode: HttpStatus.CREATED,
        data: ChangePointUserLog,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw ChangePointUserLogAlreadyExistsException
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
    data: UpdateChangePointUserLogBodyType
    updatedById: number
  }) {
    try {
      // Disallow changing userId: our Update schema has no userId, but double-check if client sends it
      if ((data as any).userId !== undefined) {
        throw new BadRequestException('Không được phép thay đổi user')
      }

      const updatedChangePointUserLog = await this.ChangePointUserLogRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedChangePointUserLog,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw ChangePointUserLogAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.ChangePointUserLogRepo.delete({
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
        throw ChangePointUserLogAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
