import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CHI_TIET_KY_NHAN_BOI_CANH_LICH_SU_VA_SUU_THAN_FIELDS,
  ChiTietKyNhanBoiCanhLichSuVaSuuThanType,
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType,
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType
} from './entities/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.entities'

@Injectable()
export class ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo {
  constructor(private prismaService: PrismaService) { }

  async create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType
  }): Promise<ChiTietKyNhanBoiCanhLichSuVaSuuThanType> {
    // Tự động tính thuTu nếu không được cung cấp
    const thuTu = data.thuTu !== undefined ? data.thuTu : await this.getNextThuTu(data.chiTietKyNhanId)

    return this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.create({
      data: {
        ...data,
        thuTu,
        createdById
      }
    })
  }

  private async getNextThuTu(chiTietKyNhanId: number): Promise<number> {
    const lastRecord = await this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.findFirst({
      where: {
        chiTietKyNhanId,
        deletedAt: null
      },
      orderBy: {
        thuTu: 'desc'
      },
      select: {
        thuTu: true
      }
    })

    return (lastRecord?.thuTu || 0) + 1
  }

  update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyType
  }): Promise<ChiTietKyNhanBoiCanhLichSuVaSuuThanType> {
    return this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
      }
    })
  }

  delete(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<ChiTietKyNhanBoiCanhLichSuVaSuuThanType> {
    return isHard
      ? this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.delete({
        where: {
          id
        }
      })
      : this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.update({
        where: {
          id,
          deletedAt: null
        },
        data: {
          deletedAt: new Date(),
          deletedById
        }
      })
  }

  async list(pagination: PaginationQueryType) {
    const { where, orderBy } = parseQs(pagination.qs, CHI_TIET_KY_NHAN_BOI_CANH_LICH_SU_VA_SUU_THAN_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.findMany({
        where: { deletedAt: null, ...where },
        include: {
          chiTietKyNhan: true
        },
        orderBy,
        skip,
        take
      })
    ])

    return {
      results: data,
      pagination: {
        current: pagination.currentPage,
        pageSize: pagination.pageSize,
        totalPage: Math.ceil(totalItems / pagination.pageSize),
        totalItem: totalItems
      }
    }
  }

  findById(id: number): Promise<ChiTietKyNhanBoiCanhLichSuVaSuuThanType | null> {
    return this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        chiTietKyNhan: true
      }
    })
  }

  findByChiTietKyNhanId(chiTietKyNhanId: number): Promise<ChiTietKyNhanBoiCanhLichSuVaSuuThanType[]> {
    return this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.findMany({
      where: {
        chiTietKyNhanId,
        deletedAt: null
      },
      include: {
        chiTietKyNhan: true
      },
      orderBy: {
        thuTu: 'asc',
        createdAt: 'asc'
      }
    })
  }

  findExistByTitleAndChiTiet(tieuDe: string, chiTietKyNhanId: number): Promise<ChiTietKyNhanBoiCanhLichSuVaSuuThanType | null> {
    return this.prismaService.chiTietKyNhanBoiCanhLichSuVaSuuThan.findFirst({
      where: {
        tieuDe,
        chiTietKyNhanId,
        deletedAt: null
      }
    })
  }
}
