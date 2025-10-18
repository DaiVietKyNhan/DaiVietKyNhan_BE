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
import { LandBargeRepo } from '../land-barge/land-barge.repo'
import { UserLandBargeAlreadyExistsException } from './dto/user-land-barge.error'
import { UserLandBargeRepo } from './user-land-barge.repo'

@Injectable()
export class UserLandBargeService {
  constructor(
    private UserLandBargeRepo: UserLandBargeRepo,
    private readonly sharedUserRepo: SharedUserRepository,
    private readonly landRepo: LandBargeRepo
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.UserLandBargeRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.UserLandBargeRepo.findById(id)
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
    const createdUserLandBarges =
      await this.UserLandBargeRepo.createOrUpdateWithUserIdAndListLandId({
        userId,
        landIds
      })

    return {
      statusCode: HttpStatus.OK,
      data: createdUserLandBarges,
      message: ENTITY_MESSAGE.CREATE_SUCCESS
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.UserLandBargeRepo.delete({
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
        throw UserLandBargeAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  getLandByUserId(userId: number) {
    return {
      statusCode: HttpStatus.OK,
      data: this.UserLandBargeRepo.getByUser(userId),
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }
}
