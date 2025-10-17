import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

import envConfig from '@/config/env.config'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { HashingService } from '@/shared/services/hashing.service'
import { EmailAlreadyExistsException } from '../auth/dto/auth.error'
import { UserMaxHeartException, UserNotEnoughCoinException } from './dto/user.error'
import { CreateUserBodyType, UpdateUserBodyType } from './entities/user.entity'
import { UserRepo } from './user.repo'

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepo,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepo: SharedRoleRepository,
    private readonly sharedUserRepo: SharedUserRepository
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.userRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async getUserList(pagination: PaginationQueryType) {
    const customerId = await this.sharedRoleRepo.getCustomerRoleId()
    if (!customerId) {
      throw NotFoundRecordException
    }
    const data = await this.userRepo.list(pagination, customerId)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: user,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async findByIdOrEmail(identifier: string | number) {
    const where =
      typeof identifier === 'number' ? { id: identifier } : { email: String(identifier) }

    const user = await this.userRepo.findByIdOrEmail(where)
    if (!user) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: user,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({ data, createdById }: { data: CreateUserBodyType; createdById: number }) {
    try {
      const { confirmPassword, ...userData } = data
      userData.password = await this.hashingService.hash(data.password)
      const user = await this.userRepo.create({
        createdById,
        data: userData
      })

      if (envConfig.NEXTJS_APP_URL) {
        try {
          await fetch(`${envConfig.NEXTJS_APP_URL}/api/revalidate?tag=modifyUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          console.log('Sent revalidation request to Next.js')
        } catch (err) {
          // Log error nhưng không throw để không ảnh hưởng đến response chính
          console.warn('Failed to send revalidation request to Next.js:', err.message)
        }
      }
      return {
        statusCode: HttpStatus.CREATED,
        data: user,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
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
    data: UpdateUserBodyType
    updatedById: number
  }) {
    try {
      if (data.password) {
        data.password = await this.hashingService.hash(data.password)
      }
      const updatedUser = await this.userRepo.update({
        id,
        updatedById,
        data
      })
      if (envConfig.NEXTJS_APP_URL) {
        try {
          await fetch(`${envConfig.NEXTJS_APP_URL}/api/revalidate?tag=modifyUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          console.log('Sent revalidation request to Next.js')
        } catch (err) {
          // Log error nhưng không throw để không ảnh hưởng đến response chính
          console.warn('Failed to send revalidation request to Next.js:', err.message)
        }
      }
      return {
        statusCode: HttpStatus.OK,
        data: updatedUser,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.userRepo.delete({
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

  async addHeartToUser(userId: number) {
    try {
      const user = await this.sharedUserRepo.findUnique({ id: userId })
      if (!user) {
        throw NotFoundRecordException
      }
      if (user.coin < 100) {
        throw UserNotEnoughCoinException
      }
      if (user.heart >= 3) {
        throw UserMaxHeartException
      }
      const [updatedUser] = await Promise.all([
        this.sharedUserRepo.addHeart({ userId, amount: 1 }),
        await this.sharedUserRepo.minusCoinByUserId({
          userId,
          amount: 100
        })
      ])

      return {
        statusCode: HttpStatus.OK,
        data: updatedUser,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
