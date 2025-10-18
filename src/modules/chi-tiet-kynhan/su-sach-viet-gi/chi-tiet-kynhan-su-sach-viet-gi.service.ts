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
    ChiTietKyNhanSuSachVietGiType,
    CreateChiTietKyNhanSuSachVietGiBodyType,
    UpdateChiTietKyNhanSuSachVietGiBodyType
} from './entities/chi-tiet-kynhan-su-sach-viet-gi.entities'
import { ChiTietKyNhanSuSachVietGiRepo } from './chi-tiet-kynhan-su-sach-viet-gi.repo'

@Injectable()
export class ChiTietKyNhanSuSachVietGiService {
    constructor(private chiTietKyNhanSuSachVietGiRepo: ChiTietKyNhanSuSachVietGiRepo) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.chiTietKyNhanSuSachVietGiRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findById(id: number) {
        const suSachVietGi = await this.chiTietKyNhanSuSachVietGiRepo.findById(id)
        if (!suSachVietGi) {
            throw NotFoundRecordException
        }
        return {
            statusCode: HttpStatus.OK,
            data: suSachVietGi,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async findByChiTietKyNhanId(chiTietKyNhanId: number) {
        const suSachVietGi = await this.chiTietKyNhanSuSachVietGiRepo.findByChiTietKyNhanId(chiTietKyNhanId)
        return {
            statusCode: HttpStatus.OK,
            data: suSachVietGi,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateChiTietKyNhanSuSachVietGiBodyType
        createdById: number
    }) {
        try {
            // Kiểm tra xem đã có sử sách với tên này cho chi tiết kỳ nhân này chưa
            const isDuplicateTitle = data.tieuDe
                ? await this.chiTietKyNhanSuSachVietGiRepo.findExistByTitleAndChiTiet(data.tieuDe, data.chiTietKyNhanId)
                : null
            if (isDuplicateTitle) {
                throw ChiTietKyNhanAlreadyExistsException
            }

            const suSachVietGi = await this.chiTietKyNhanSuSachVietGiRepo.create({
                createdById,
                data
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: suSachVietGi,
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
        data: UpdateChiTietKyNhanSuSachVietGiBodyType
        updatedById: number
    }) {
        try {
            const existing = await this.chiTietKyNhanSuSachVietGiRepo.findById(id)
            if (!existing) {
                throw NotFoundRecordException
            }

            // Kiểm tra duplicate title nếu đang update title
            if (data.tieuDe) {
                const isDuplicateTitle = await this.chiTietKyNhanSuSachVietGiRepo.findExistByTitleAndChiTiet(
                    data.tieuDe,
                    data.chiTietKyNhanId || existing.chiTietKyNhanId
                )
                if (isDuplicateTitle && isDuplicateTitle.id !== id) {
                    throw ChiTietKyNhanAlreadyExistsException
                }
            }

            const updatedSuSachVietGi = await this.chiTietKyNhanSuSachVietGiRepo.update({
                id,
                updatedById,
                data
            })
            return {
                statusCode: HttpStatus.OK,
                data: updatedSuSachVietGi,
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
            await this.chiTietKyNhanSuSachVietGiRepo.delete({
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
