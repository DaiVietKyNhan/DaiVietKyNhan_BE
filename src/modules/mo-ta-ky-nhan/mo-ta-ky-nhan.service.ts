import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { MotaKyNhanAlreadyExistsException } from './dto/mo-ta-ky-nhan.error'

import {
  CreateMotaKyNhanBodyType,
  UpdateMotaKyNhanBodyType
} from './entities/mo-ta-ky-nhan.entity'
import { MotaKyNhanRepo } from './mo-ta-ky-nhan.repo'

@Injectable()
export class MotaKyNhanService {
  constructor(
    private motaKyNhanRepo: MotaKyNhanRepo,
    private readonly uploadService: UploadService
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.motaKyNhanRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.motaKyNhanRepo.findById(id)
    if (!attendenceConfig) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: attendenceConfig,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async findByKyNhanId(id: number) {
    const attendenceConfig = await this.motaKyNhanRepo.findByKyNhanId(id)
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
    data: CreateMotaKyNhanBodyType
    createdById: number
    imgFile: Express.Multer.File
  }) {
    try {
      if (imgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'motakynhan',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }
        } catch (uploadError) {
          throw uploadError
        }
      } else {
        throw new UnprocessableEntityException([
          { path: 'imgUrl', message: 'Thiếu ảnh hoặc ảnh không hợp lệ' }
        ])
      }

      if (data.imgUrl === '') {
      }

      const attendenceConfig = await this.motaKyNhanRepo.create({
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
        throw MotaKyNhanAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isNotFoundPrismaError(error)) {
        throw MotaKyNhanAlreadyExistsException
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
    data: UpdateMotaKyNhanBodyType
    updatedById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      const existing = await this.motaKyNhanRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      if (imgFile) {
        try {
          // Upload new image into god-profiles/images
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'motakynhan',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }

          // Try to delete old image if existed
          if (existing.imgUrl) {
            try {
              await this.uploadService.deleteFile(existing.imgUrl, 'motakynhan/images')
            } catch (delErr) {}
          }
        } catch (uploadError) {
          throw uploadError
        }
      }

      const updatedMotaKyNhan = await this.motaKyNhanRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedMotaKyNhan,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw MotaKyNhanAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.motaKyNhanRepo.delete({
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
