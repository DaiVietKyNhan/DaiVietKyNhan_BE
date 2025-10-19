import { ANSWER_SCALE_MESSAGE, ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { BadRequestException } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { KyNhanSummaryAlreadyExistsException } from './dto/kynhan-summary.error'
import {
  CreateKyNhanSummaryBodySchema,
  CreateKyNhanSummaryBodyType,
  UpdateKyNhanSummaryBodySchema,
  UpdateKyNhanSummaryBodyType
} from './entities/kynhan-summary.entity'
import { KyNhanSummaryRepo } from './kynhan-summary.repo'

@Injectable()
export class KyNhanSummaryService {
  constructor(
    private kyNhanSummaryRepo: KyNhanSummaryRepo,
    private readonly uploadService: UploadService
  ) {}

  private readonly logger = new Logger(KyNhanSummaryService.name)

  async list(pagination: PaginationQueryType) {
    const data = await this.kyNhanSummaryRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.kyNhanSummaryRepo.findById(id)
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
    data: CreateKyNhanSummaryBodyType
    createdById: number
    imgFile: Express.Multer.File
  }) {
    let imgUrlUpload = ''
    try {
      // If an image file is provided, upload it first and attach the URL to data
      if (imgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'kynhan-summarys',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }
          imgUrlUpload = uploadRes.url
        } catch (uploadError) {
          this.logger.warn('Upload image failed for create kynhan-summary', uploadError)
          throw uploadError
        }
      }

      // Validate & coerce using Zod schema (ensures numbers, urls, etc.)
      const parsed = CreateKyNhanSummaryBodySchema.safeParse(data)
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

      const createGodPriflie = await this.kyNhanSummaryRepo.create({
        createdById,
        data: parsed.data as CreateKyNhanSummaryBodyType
      })

      return {
        statusCode: HttpStatus.CREATED,
        data: createGodPriflie,
        message: ANSWER_SCALE_MESSAGE.ANSWER_SUCCESS
      }
    } catch (error) {
      if (imgUrlUpload) {
        await this.delImgeWhenFail(imgUrlUpload)
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw KyNhanSummaryAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isNotFoundPrismaError(error)) {
        throw KyNhanSummaryAlreadyExistsException
      }

      throw error
    }
  }

  async delImgeWhenFail(imgUrl: string) {
    await this.uploadService.deleteFile(imgUrl, 'kynhan-summarys/images')
  }

  async update({
    id,
    data,
    updatedById,
    imgFile
  }: {
    id: number
    data: UpdateKyNhanSummaryBodyType
    updatedById: number
    imgFile?: Express.Multer.File
  }) {
    let imgUrlUpload = ''
    try {
      // Fetch existing record to know old imgUrl (so we can delete it if new uploaded)
      const existing = await this.kyNhanSummaryRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      if (imgFile) {
        try {
          // Upload new image into kynhan-summarys/images
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'kynhan-summarys',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }
          imgUrlUpload = uploadRes.url
          // Try to delete old image if existed
          if (existing.imgUrl) {
            try {
              await this.uploadService.deleteFile(
                existing.imgUrl,
                'kynhan-summarys/images'
              )
            } catch (delErr) {
              this.logger.warn('Failed to delete old kynhan-summary image', delErr)
            }
          }
        } catch (uploadError) {
          this.logger.warn('Upload image failed for update kynhan-summary', uploadError)
          throw uploadError
        }
      }

      // Validate partial update
      const parsed = UpdateKyNhanSummaryBodySchema.safeParse(data)
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

      const updatedKyNhanSummary = await this.kyNhanSummaryRepo.update({
        id,
        updatedById,
        data: parsed.data as UpdateKyNhanSummaryBodyType
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedKyNhanSummary,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (imgUrlUpload) {
        await this.delImgeWhenFail(imgUrlUpload)
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw KyNhanSummaryAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isNotFoundPrismaError(error)) {
        throw KyNhanSummaryAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.kyNhanSummaryRepo.delete({
        id,
        deletedById
      })
      return {
        statusCode: HttpStatus.OK,
        data: null,
        message: ENTITY_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw KyNhanSummaryAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isNotFoundPrismaError(error)) {
        throw KyNhanSummaryAlreadyExistsException
      }
      throw error
    }
  }

  async findByQuestionId(questionId: number) {
    const kynhanSummary = await this.kyNhanSummaryRepo.findByQuestionId(questionId)
    if (!kynhanSummary) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: kynhanSummary,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async findListByLandId(landId: number) {
    const kynhanSummaries = await this.kyNhanSummaryRepo.findByLandId(landId)
    return {
      statusCode: HttpStatus.OK,
      data: kynhanSummaries,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }
}
