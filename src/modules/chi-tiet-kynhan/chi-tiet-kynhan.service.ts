import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import {
    isForeignKeyConstraintPrismaError,
    isNotFoundPrismaError,
    isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { ChiTietKyNhanAlreadyExistsException } from './dto/chi-tiet-kynhan.error'
import { CreateChiTietKyNhanBodyType, UpdateChiTietKyNhanBodyType } from './entities/chi-tiet-kynhan.entities'
import { ChiTietKyNhanRepo } from './chi-tiet-kynhan.repo'

@Injectable()
export class ChiTietKyNhanService {
    constructor(private chiTietKyNhanRepo: ChiTietKyNhanRepo) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.chiTietKyNhanRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findByKyNhanId(kyNhanId: number) {
        const data = await this.chiTietKyNhanRepo.findByKyNhanId(kyNhanId)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findById(id: number) {
        const chiTietKyNhan = await this.chiTietKyNhanRepo.findById(id)
        if (!chiTietKyNhan) {
            throw NotFoundRecordException
        }
        return {
            statusCode: HttpStatus.OK,
            data: chiTietKyNhan,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateChiTietKyNhanBodyType
        createdById: number
    }) {
        try {
            // Kiểm tra xem đã có chi tiết với tên này cho kỳ nhân này chưa
            const isDuplicateName = data.ten
                ? await this.chiTietKyNhanRepo.findExistByNameAndKyNhan(data.ten, data.kyNhanId)
                : null
            if (isDuplicateName) {
                throw ChiTietKyNhanAlreadyExistsException
            }

            const chiTietKyNhan = await this.chiTietKyNhanRepo.create({
                createdById,
                data
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: chiTietKyNhan,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw ChiTietKyNhanAlreadyExistsException
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
        updatedById
    }: {
        id: number
        data: UpdateChiTietKyNhanBodyType
        updatedById: number
    }) {
        try {
            const existing = await this.chiTietKyNhanRepo.findById(id)
            if (!existing) {
                throw NotFoundRecordException
            }

            // Kiểm tra tên trùng lặp nếu có thay đổi tên
            if (data.ten && data.ten !== existing.ten) {
                const isDuplicateName = await this.chiTietKyNhanRepo.findExistByNameAndKyNhan(
                    data.ten,
                    data.kyNhanId || existing.kyNhanId
                )
                if (isDuplicateName && isDuplicateName.id !== id) {
                    throw ChiTietKyNhanAlreadyExistsException
                }
            }

            const updatedChiTietKyNhan = await this.chiTietKyNhanRepo.update({
                id,
                updatedById,
                data
            })

            return {
                statusCode: HttpStatus.OK,
                data: updatedChiTietKyNhan,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw ChiTietKyNhanAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }

    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.chiTietKyNhanRepo.delete({
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
