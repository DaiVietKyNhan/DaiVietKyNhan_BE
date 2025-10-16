import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import {
  FigureAlreadyExistsException,
  UserFigureAlreadyExistsException
} from './dto/figure.error'
import {
  CreateFigureBodySchema,
  CreateFigureBodyType,
  UpdateFigureBodySchema,
  UpdateFigureBodyType
} from './entities/figure.entity'
import { FigureRepo } from './figure.repo'

@Injectable()
export class FigureService {
  constructor(
    private testQuestionHomeRepo: FigureRepo,
    private uploadService: UploadService,
    private readonly sharedUserRepo: SharedUserRepository
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.testQuestionHomeRepo.list(pagination)
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

  async addFigureToUser(figureId: number, userId: number) {
    const [user, figure] = await Promise.all([
      this.sharedUserRepo.findUnique({ id: userId }),
      this.testQuestionHomeRepo.findById(figureId)
    ])
    if (!user || user.figureId) {
      throw UserFigureAlreadyExistsException
    }

    if (!figure) {
      throw NotFoundRecordException
    }

    const updatedUser = await this.sharedUserRepo.updateUserById(userId, { figureId })
    return {
      statusCode: HttpStatus.OK,
      data: updatedUser,
      message: ENTITY_MESSAGE.UPDATE_SUCCESS
    }
  }

  async create({
    data,
    createdById,
    imgFile
  }: {
    data: CreateFigureBodyType
    createdById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      // Upload image if provided
      if (imgFile) {
        const uploadResult = await this.uploadService.uploadFileByType(
          imgFile,
          'figures',
          'images'
        )
        data.imageUrl = uploadResult.url
      }

      // Validate after upload
      const validationResult = CreateFigureBodySchema.safeParse(data)
      if (!validationResult.success) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: validationResult.error.errors.map((e) => e.message).join(', ')
        }
      }

      const attendenceConfig = await this.testQuestionHomeRepo.create({
        createdById,
        data: validationResult.data
      })
      return {
        statusCode: HttpStatus.CREATED,
        data: attendenceConfig,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw FigureAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
    imgFile
  }: {
    id: number
    data: UpdateFigureBodyType
    updatedById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      // Get existing record to check for old image
      const existing = await this.testQuestionHomeRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      // Upload new image if provided
      if (imgFile) {
        const uploadResult = await this.uploadService.uploadFileByType(
          imgFile,
          'figures',
          'images'
        )
        data.imageUrl = uploadResult.url

        // Delete old image if exists
        if (existing.imageUrl) {
          await this.uploadService.deleteFile(existing.imageUrl, 'figures/images')
        }
      }

      // Validate after upload
      const validationResult = UpdateFigureBodySchema.safeParse(data)
      if (!validationResult.success) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: validationResult.error.errors.map((e) => e.message).join(', ')
        }
      }

      const updatedFigure = await this.testQuestionHomeRepo.update({
        id,
        updatedById,
        data: validationResult.data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedFigure,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw FigureAlreadyExistsException
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
