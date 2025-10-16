import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { LandRepo } from '../land/land.repo'
import { UserLandAlreadyExistsException } from './dto/user-land.error'
import {
  CreateUserLandBodyType,
  UpdateUserLandBodyType
} from './entities/user-land.entity'
import { UserLandRepo } from './user-land.repo'

@Injectable()
export class UserLandService {
  constructor(
    private userLandRepo: UserLandRepo,
    private readonly sharedUserRepo: SharedUserRepository,
    private readonly landRepo: LandRepo
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.userLandRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.userLandRepo.findById(id)
    if (!attendenceConfig) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: attendenceConfig,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async createListForUser({ userId }: { userId: number }) {
    const existUser = await this.sharedUserRepo.findUnique({ id: userId })

    if (!existUser) {
      throw NotFoundRecordException
    }

    // Lấy tất cả các vùng đất
    const lands = await this.landRepo.findAll()

    const landIds = lands.map((land) => land.id)

    // createOrUpdate cho từng vùng đất
    const createdUserLands =
      await this.userLandRepo.createOrUpdateWithUserIdAndListLandId({
        userId,
        landIds
      })

    return {
      statusCode: HttpStatus.OK,
      data: createdUserLands,
      message: ENTITY_MESSAGE.CREATE_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateUserLandBodyType
    createdById: number
  }) {
    try {
      // check xem co bij trung vung dat nao khon
      const isExist = await this.userLandRepo.findByUserIdAndLandId(
        data.userId,
        data.landId
      )

      if (isExist) {
        // Nếu đã tồn tại thì ném lỗi
        throw UserLandAlreadyExistsException
      }

      const attendenceConfig = await this.userLandRepo.create({
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
        throw UserLandAlreadyExistsException
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
    data: UpdateUserLandBodyType
    updatedById: number
  }) {
    try {
      const isExist = await this.userLandRepo.findById(id)
      if (!isExist) {
        throw NotFoundRecordException
      }

      const updatedUserLand = await this.userLandRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedUserLand,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserLandAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.userLandRepo.delete({
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
        throw UserLandAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async getLandByUserId(userId: number) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.userLandRepo.getLandsByUserId(userId),
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }
}
