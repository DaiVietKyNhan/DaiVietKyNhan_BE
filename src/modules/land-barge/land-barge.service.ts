import { ANSWER_SCALE_MESSAGE, ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { BadRequestException } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { LandBargeAlreadyExistsException } from './dto/land-barge.error'
import {
  CreateLandBargeBodySchema,
  CreateLandBargeBodyType,
  UpdateLandBargeBodySchema,
  UpdateLandBargeBodyType
} from './entities/land-barge.entity'
import { LandBargeRepo } from './land-barge.repo'

@Injectable()
export class LandBargeService {
  constructor(
    private LandBargeRepo: LandBargeRepo,
    private readonly sharedUserRepo: SharedUserRepository,
    private readonly uploadService: UploadService
  ) {}

  private readonly logger = new Logger(LandBargeService.name)

  async list(pagination: PaginationQueryType) {
    const data = await this.LandBargeRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.LandBargeRepo.findById(id)
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
    createdById,
    imgFile
  }: {
    data: CreateLandBargeBodyType
    createdById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      let imgUrl = ''
      // If an image file is provided, upload it first and attach the URL to data
      if (imgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'land-barges',
            'images'
          )
          imgUrl = uploadRes.url
        } catch (uploadError) {
          this.logger.warn('Upload image failed for create land-barges', uploadError)
          throw uploadError
        }
      }

      // Validate & coerce using Zod schema (ensures numbers, urls, etc.)
      const parsed = CreateLandBargeBodySchema.safeParse(data)
      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => ({
          message: e.message,
          path: e.path.join('.')
        }))
        throw new BadRequestException({
          message: errors,
          error: 'Unprocessable Entity',
          statusCode: 422
        })
      }

      const createGodPriflie = await this.LandBargeRepo.create({
        createdById,
        data: {
          ...parsed.data,
          ...(imgUrl ? { imgUrl } : {})
        }
      })

      return {
        statusCode: HttpStatus.CREATED,
        data: createGodPriflie,
        message: ANSWER_SCALE_MESSAGE.ANSWER_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw LandBargeAlreadyExistsException
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
    updatedById,
    imgFile
  }: {
    id: number
    data: UpdateLandBargeBodyType
    updatedById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      let imgUrl = ''
      // Fetch existing recor d to know old imgUrl (so we can delete it if new uploaded)
      const existing = await this.LandBargeRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      if (imgFile) {
        try {
          // Upload new image into land-bargess/images
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'land-bargess',
            'images'
          )
          imgUrl = uploadRes.url

          // Try to delete old image if existed
          if (existing.imgUrl) {
            try {
              await this.uploadService.deleteFile(existing.imgUrl, 'land-bargess/images')
            } catch (delErr) {
              this.logger.warn('Failed to delete old land-barges image', delErr)
            }
          }
        } catch (uploadError) {
          this.logger.warn('Upload image failed for update land-barges', uploadError)
          throw uploadError
        }
      }

      // Validate partial update
      const parsed = UpdateLandBargeBodySchema.safeParse(data)
      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => ({
          message: e.message,
          path: e.path.join('.')
        }))
        throw new BadRequestException({
          message: errors,
          error: 'Unprocessable Entity',
          statusCode: 422
        })
      }

      const updatedLandBarge = await this.LandBargeRepo.update({
        id,
        updatedById,
        data: {
          ...parsed.data,
          ...(imgUrl ? { imgUrl } : {})
        }
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedLandBarge,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw LandBargeAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.LandBargeRepo.delete({
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
