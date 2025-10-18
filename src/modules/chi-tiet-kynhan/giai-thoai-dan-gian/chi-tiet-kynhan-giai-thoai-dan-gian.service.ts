import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import {
    isForeignKeyConstraintPrismaError,
    isNotFoundPrismaError,
    isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { ChiTietKyNhanAlreadyExistsException } from '../dto/chi-tiet-kynhan.error'
import {
    ChiTietKyNhanGiaiThoaiDanGianType,
    CreateChiTietKyNhanGiaiThoaiDanGianBodyType,
    UpdateChiTietKyNhanGiaiThoaiDanGianBodyType
} from './entities/chi-tiet-kynhan-giai-thoai-dan-gian.entities'
import { ChiTietKyNhanGiaiThoaiDanGianRepo } from './chi-tiet-kynhan-giai-thoai-dan-gian.repo'

@Injectable()
export class ChiTietKyNhanGiaiThoaiDanGianService {
    constructor(private chiTietKyNhanGiaiThoaiDanGianRepo: ChiTietKyNhanGiaiThoaiDanGianRepo) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.chiTietKyNhanGiaiThoaiDanGianRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findById(id: number) {
        const giaiThoaiDanGian = await this.chiTietKyNhanGiaiThoaiDanGianRepo.findById(id)
        if (!giaiThoaiDanGian) {
            throw NotFoundRecordException
        }
        return {
            statusCode: HttpStatus.OK,
            data: giaiThoaiDanGian,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async findByChiTietKyNhanId(chiTietKyNhanId: number) {
        const giaiThoaiDanGian = await this.chiTietKyNhanGiaiThoaiDanGianRepo.findByChiTietKyNhanId(chiTietKyNhanId)
        return {
            statusCode: HttpStatus.OK,
            data: giaiThoaiDanGian,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateChiTietKyNhanGiaiThoaiDanGianBodyType
        createdById: number
    }) {
        try {
            // Kiểm tra xem đã có giai thoại dân gian với tên này cho chi tiết kỳ nhân này chưa
            const isDuplicateTitle = data.tieuDe
                ? await this.chiTietKyNhanGiaiThoaiDanGianRepo.findExistByTitleAndChiTiet(data.tieuDe, data.chiTietKyNhanId)
                : null
            if (isDuplicateTitle) {
                throw ChiTietKyNhanAlreadyExistsException
            }

            const giaiThoaiDanGian = await this.chiTietKyNhanGiaiThoaiDanGianRepo.create({
                createdById,
                data
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: giaiThoaiDanGian,
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
        data: UpdateChiTietKyNhanGiaiThoaiDanGianBodyType
        updatedById: number
    }) {
        try {
            const existing = await this.chiTietKyNhanGiaiThoaiDanGianRepo.findById(id)
            if (!existing) {
                throw NotFoundRecordException
            }

            // Kiểm tra duplicate title nếu đang update title
            if (data.tieuDe) {
                const isDuplicateTitle = await this.chiTietKyNhanGiaiThoaiDanGianRepo.findExistByTitleAndChiTiet(
                    data.tieuDe,
                    data.chiTietKyNhanId || existing.chiTietKyNhanId
                )
                if (isDuplicateTitle && isDuplicateTitle.id !== id) {
                    throw ChiTietKyNhanAlreadyExistsException
                }
            }

            const updatedGiaiThoaiDanGian = await this.chiTietKyNhanGiaiThoaiDanGianRepo.update({
                id,
                updatedById,
                data
            })
            return {
                statusCode: HttpStatus.OK,
                data: updatedGiaiThoaiDanGian,
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
            await this.chiTietKyNhanGiaiThoaiDanGianRepo.delete({
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
            if (isUniqueConstraintPrismaError(error)) {
                throw ChiTietKyNhanAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }
}
