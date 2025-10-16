import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { KynhanAlreadyExistsException } from './dto/kynhan.error'
import { CreateKyNhanBodyType, UpdateKyNhanBodyType } from './entities/kynhan.entities'
import { KynhanRepo } from './kynhan.repo'

@Injectable()
export class KynhanService {
  constructor(
    private kynhanRepo: KynhanRepo,
    private readonly uploadService: UploadService
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.kynhanRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.kynhanRepo.findById(id)
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
    data: CreateKyNhanBodyType
    createdById: number
    imgFile: Express.Multer.File
  }) {
    try {
      const isDupplicateName = data.name
        ? await this.kynhanRepo.findExistByName(data.name)
        : null
      if (isDupplicateName) {
        throw KynhanAlreadyExistsException
      }
      if (imgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'kynhan',
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

      const attendenceConfig = await this.kynhanRepo.create({
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
        throw KynhanAlreadyExistsException
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
    data: UpdateKyNhanBodyType
    updatedById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      const existing = await this.kynhanRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      const isDupplicateName = data.name
        ? await this.kynhanRepo.findExistByName(data.name)
        : null
      if (isDupplicateName && isDupplicateName.id !== id) {
        throw KynhanAlreadyExistsException
      }
      if (imgFile) {
        try {
          // Upload new image into god-profiles/images
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'kynhan',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }

          // Try to delete old image if existed
          if (existing.imgUrl) {
            try {
              await this.uploadService.deleteFile(existing.imgUrl, 'kynhan/images')
            } catch (delErr) {}
          }
        } catch (uploadError) {
          throw uploadError
        }
      }

      const updatedKynhan = await this.kynhanRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedKynhan,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw KynhanAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.kynhanRepo.delete({
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
