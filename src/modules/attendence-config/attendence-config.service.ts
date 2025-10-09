import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { AttendenceConfigRepo } from './attendence-config.repo'
import { AttendenceConfigAlreadyExistsException } from './dto/attendence-config.error'
import {
  CreateAttendanceConfigBodyType,
  UpdateAttendanceConfigBodyType
} from './entities/attendence-config.entity'

@Injectable()
export class AttendenceConfigService {
  constructor(private attendenceConfigRepo: AttendenceConfigRepo) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.attendenceConfigRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.attendenceConfigRepo.findById(id)
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
    data: CreateAttendanceConfigBodyType
    createdById: number
  }) {
    try {
      const attendenceConfig = await this.attendenceConfigRepo.create({
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
        throw AttendenceConfigAlreadyExistsException
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
    data: UpdateAttendanceConfigBodyType
    updatedById: number
  }) {
    try {
      const updatedAttendenceConfig = await this.attendenceConfigRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedAttendenceConfig,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw AttendenceConfigAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.attendenceConfigRepo.delete({
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
