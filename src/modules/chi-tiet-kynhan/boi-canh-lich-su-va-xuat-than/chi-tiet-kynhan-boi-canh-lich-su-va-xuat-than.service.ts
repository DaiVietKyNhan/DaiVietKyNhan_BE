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
  ChiTietKyNhanBoiCanhLichSuVaSuuThanType,
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType,
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType
} from './entities/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.entities'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo } from './chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.repo'

@Injectable()
export class ChiTietKyNhanBoiCanhLichSuVaSuuThanService {
  constructor(private chiTietKyNhanBoiCanhLichSuVaSuuThanRepo: ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo) { }

  async list(pagination: PaginationQueryType) {
    const data = await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const boiCanhLichSuVaSuuThan = await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.findById(id)
    if (!boiCanhLichSuVaSuuThan) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: boiCanhLichSuVaSuuThan,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async findByChiTietKyNhanId(chiTietKyNhanId: number) {
    const boiCanhLichSuVaSuuThan = await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.findByChiTietKyNhanId(chiTietKyNhanId)
    return {
      statusCode: HttpStatus.OK,
      data: boiCanhLichSuVaSuuThan,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType
    createdById: number
  }) {
    try {
      // Kiểm tra xem đã có bối cảnh lịch sử với tên này cho chi tiết kỳ nhân này chưa
      const isDuplicateTitle = data.tieuDe
        ? await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.findExistByTitleAndChiTiet(data.tieuDe, data.chiTietKyNhanId)
        : null
      if (isDuplicateTitle) {
        throw ChiTietKyNhanAlreadyExistsException
      }

      const boiCanhLichSuVaSuuThan = await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.create({
        createdById,
        data
      })

      return {
        statusCode: HttpStatus.CREATED,
        data: boiCanhLichSuVaSuuThan,
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
    data: UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType
    updatedById: number
  }) {
    try {
      const existing = await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      // Kiểm tra duplicate title nếu đang update title
      if (data.tieuDe) {
        const isDuplicateTitle = await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.findExistByTitleAndChiTiet(
          data.tieuDe,
          data.chiTietKyNhanId || existing.chiTietKyNhanId
        )
        if (isDuplicateTitle && isDuplicateTitle.id !== id) {
          throw ChiTietKyNhanAlreadyExistsException
        }
      }

      const updatedBoiCanhLichSuVaSuuThan = await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedBoiCanhLichSuVaSuuThan,
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
      await this.chiTietKyNhanBoiCanhLichSuVaSuuThanRepo.delete({
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
