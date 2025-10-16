import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { LandAlreadyExistsException } from './dto/land.error'
import { CreateLandBodyType, UpdateLandBodyType } from './entities/land.entity'
import { LandRepo } from './land.repo'

@Injectable()
export class LandService {
  constructor(private landRepo: LandRepo) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.landRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.landRepo.findById(id)
    if (!attendenceConfig) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: attendenceConfig,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({ data, createdById }: { data: CreateLandBodyType; createdById: number }) {
    try {
      const attendenceConfig = await this.landRepo.create({
        createdById,
        data
      })
      return {
        statusCode: HttpStatus.CREATED,
        data: attendenceConfig,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw LandAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
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
    data: UpdateLandBodyType
    updatedById: number
  }) {
    try {
      const updatedLand = await this.landRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedLand,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw LandAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.landRepo.delete({
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
        throw LandAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
