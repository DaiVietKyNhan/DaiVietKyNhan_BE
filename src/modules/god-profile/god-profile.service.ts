import { ANSWER_SCALE_MESSAGE, ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { TestQuestionHomeRepo } from '@/modules/test-question-home/test-question-home.repo'
import { getPointHome } from '@/shared/helpers'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { BadRequestException } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { GodProfileAlreadyExistsException } from './dto/god-profile.error'
import {
  CreateGodProfileBodySchema,
  CreateGodProfileBodyType,
  UpdateGodProfileBodySchema,
  UpdateGodProfileBodyType
} from './entities/god-profile.entity'
import { GodProfileRepo } from './god-profile.repo'

@Injectable()
export class GodProfileService {
  constructor(
    private godProfileRepo: GodProfileRepo,
    private readonly sharedUserRepo: SharedUserRepository,
    private readonly uploadService: UploadService,
    private readonly testQuestionHomeRepo: TestQuestionHomeRepo
  ) {}

  private readonly logger = new Logger(GodProfileService.name)

  async list(pagination: PaginationQueryType) {
    const data = await this.godProfileRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.godProfileRepo.findById(id)
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
    data: CreateGodProfileBodyType
    createdById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      // If an image file is provided, upload it first and attach the URL to data
      if (imgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'god-profiles',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }
        } catch (uploadError) {
          this.logger.warn('Upload image failed for create god-profile', uploadError)
          throw uploadError
        }
      }

      // Validate & coerce using Zod schema (ensures numbers, urls, etc.)
      const parsed = CreateGodProfileBodySchema.safeParse(data)
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

      const createGodPriflie = await this.godProfileRepo.create({
        createdById,
        data: parsed.data as CreateGodProfileBodyType
      })

      return {
        statusCode: HttpStatus.CREATED,
        data: createGodPriflie,
        message: ANSWER_SCALE_MESSAGE.ANSWER_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw GodProfileAlreadyExistsException
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
    data: UpdateGodProfileBodyType
    updatedById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      // Fetch existing record to know old imgUrl (so we can delete it if new uploaded)
      const existing = await this.godProfileRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      if (imgFile) {
        try {
          // Upload new image into god-profiles/images
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'god-profiles',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }

          // Try to delete old image if existed
          if (existing.imgUrl) {
            try {
              await this.uploadService.deleteFile(existing.imgUrl, 'god-profiles/images')
            } catch (delErr) {
              this.logger.warn('Failed to delete old god-profile image', delErr)
            }
          }
        } catch (uploadError) {
          this.logger.warn('Upload image failed for update god-profile', uploadError)
          throw uploadError
        }
      }

      // Validate partial update
      const parsed = UpdateGodProfileBodySchema.safeParse(data)
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

      const updatedGodProfile = await this.godProfileRepo.update({
        id,
        updatedById,
        data: parsed.data as UpdateGodProfileBodyType
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedGodProfile,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw GodProfileAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.godProfileRepo.delete({
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

  async findGodByPoint(userId: number) {
    const userInfo = await this.sharedUserRepo.findUnique({ id: userId })
    if (!userInfo) {
      throw NotFoundRecordException
    }

    // 1) get list of questions with user's answer
    const questionsWithUser = await this.testQuestionHomeRepo.getListWithUser(userId)
    const items: any[] = questionsWithUser.results || []

    // 2) aggregate points per testType
    const aggPoints: Record<string, number> = {}
    for (const q of items) {
      const testType = q.testType as string | null
      const userAnswer = q.userAnswer
      if (!testType || !userAnswer) continue
      try {
        const point =
          q.answer === userAnswer.answer
            ? getPointHome(userAnswer.answer, q.testQuestionHomeType)
            : 0
        aggPoints[testType] = (aggPoints[testType] || 0) + point
      } catch (err) {
        this.logger.warn('Failed to compute point for question', err)
      }
    }

    // console.log(JSON.stringify(aggPoints, null, 2))

    let maxPoint = -Infinity

    for (const [type, point] of Object.entries(aggPoints)) {
      if (point > maxPoint) {
        maxPoint = point
      }
    }

    // 3) get all god profiles and mark if user has score for that trait
    const godProfileList = await this.godProfileRepo.findAll()
    const returnList = godProfileList.map((god) => ({
      ...god,
      point: aggPoints[god.traitType as string] ?? 0,
      isAchieved: !!(
        god.traitType &&
        (aggPoints[god.traitType as string] ?? 0) == maxPoint &&
        maxPoint > 0
      ),
      userPoints: aggPoints[god.traitType as string] ?? 0
    }))

    return {
      statusCode: HttpStatus.OK,
      data: returnList,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async choiceGod(userId: number, godProfileId: number) {
    const [user, godProfile] = await Promise.all([
      this.sharedUserRepo.findUnique({ id: userId }),
      this.godProfileRepo.findById(godProfileId)
    ])
    if (!user || !godProfile) {
      throw NotFoundRecordException
    }

    if (user.pointTestHome === false) {
      throw new BadRequestException('Người dùng chưa làm bài trắc nghiệm')
    }
    const updatedUser = await this.sharedUserRepo.updateUserById(userId, { godProfileId })
    return {
      statusCode: HttpStatus.OK,
      data: godProfile,
      message: 'Chọn Thần Bảo Hộ thành công'
    }
  }
}
