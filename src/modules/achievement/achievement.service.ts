import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'

import { BadRequestException } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import {
    isForeignKeyConstraintPrismaError,
    isNotFoundPrismaError,
    isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { parseQs } from '@/common/utils/qs-parser'
import { AchievementAlreadyExistsException } from './dto/achievement.error'
import {
    CreateAchievementBodySchema,
    CreateAchievementBodyType,
    UpdateAchievementBodySchema,
    UpdateAchievementBodyType
} from './entities/achievement.entity'
import { AchievementRepo } from './achievement.repo'

@Injectable()
export class AchievementService {
    constructor(
        private achievementRepo: AchievementRepo,
        private logger: Logger
    ) { }

    async findMany({ pagination, where, orderBy }: { pagination: PaginationQueryType; where?: any; orderBy?: any }) {
        const [results, total] = await Promise.all([
            this.achievementRepo.findMany({ pagination, where, orderBy }),
            this.achievementRepo.findManyCount({ where })
        ])

        const { page, limit } = parseQs(pagination)

        return {
            statusCode: HttpStatus.OK,
            data: {
                results,
                total,
                page,
                limit
            },
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findById(id: number) {
        const achievement = await this.achievementRepo.findUnique({ id })
        if (!achievement) {
            throw NotFoundRecordException
        }

        return {
            statusCode: HttpStatus.OK,
            data: achievement,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateAchievementBodyType
        createdById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = CreateAchievementBodySchema.safeParse(data)
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

            const achievement = await this.achievementRepo.create({
                createdById,
                data: parsed.data as CreateAchievementBodyType
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: achievement,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw AchievementAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isNotFoundPrismaError(error)) {
                throw AchievementAlreadyExistsException
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
        data: UpdateAchievementBodyType
        updatedById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = UpdateAchievementBodySchema.safeParse(data)
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

            const achievement = await this.achievementRepo.update({
                id,
                data: parsed.data as UpdateAchievementBodyType,
                updatedById
            })

            return {
                statusCode: HttpStatus.OK,
                data: achievement,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw AchievementAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }

            throw error
        }
    }

    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.achievementRepo.delete({ id, deletedById })

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

    async getActiveAchievements() {
        const achievements = await this.achievementRepo.findActiveAchievements()

        return {
            statusCode: HttpStatus.OK,
            data: achievements,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async getAchievementsByType(type: 'KY_NHAN_SUMMARY_COUNT' | 'LAND_COLLECTION') {
        const achievements = await this.achievementRepo.findByType(type)

        return {
            statusCode: HttpStatus.OK,
            data: achievements,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }
}
