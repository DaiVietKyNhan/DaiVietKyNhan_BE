import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { BadRequestException } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import {
    isForeignKeyConstraintPrismaError,
    isNotFoundPrismaError,
    isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { parseQs } from '@/common/utils/qs-parser'
import { RewardAlreadyExistsException } from './dto/reward.error'
import {
    CreateRewardBodySchema,
    CreateRewardBodyType,
    UpdateRewardBodySchema,
    UpdateRewardBodyType
} from './entities/reward.entity'
import { RewardRepo } from './reward.repo'

@Injectable()
export class RewardService {
    constructor(
        private rewardRepo: RewardRepo
    ) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.rewardRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findById(id: number) {
        const reward = await this.rewardRepo.findUnique({ id })
        if (!reward) {
            throw NotFoundRecordException
        }

        return {
            statusCode: HttpStatus.OK,
            data: reward,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateRewardBodyType
        createdById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = CreateRewardBodySchema.safeParse(data)
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

            const reward = await this.rewardRepo.create({
                createdById,
                data: parsed.data as CreateRewardBodyType
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: reward,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw RewardAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isNotFoundPrismaError(error)) {
                throw RewardAlreadyExistsException
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
        data: UpdateRewardBodyType
        updatedById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = UpdateRewardBodySchema.safeParse(data)
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

            const reward = await this.rewardRepo.update({
                id,
                data: parsed.data as UpdateRewardBodyType,
                updatedById
            })

            return {
                statusCode: HttpStatus.OK,
                data: reward,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw RewardAlreadyExistsException
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
            await this.rewardRepo.delete({ id, deletedById })

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

    async getActiveRewards() {
        const rewards = await this.rewardRepo.findActiveRewards()

        return {
            statusCode: HttpStatus.OK,
            data: rewards,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async getRewardsByType(type: 'POINT' | 'COIN' | 'CODE') {
        const rewards = await this.rewardRepo.findByType(type)

        return {
            statusCode: HttpStatus.OK,
            data: rewards,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }
}
