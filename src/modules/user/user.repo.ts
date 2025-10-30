import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { UserType } from '@/shared/models/shared-user.model'
import { WhereUniqueUserType } from '@/shared/repositories/shared-user.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateUserBodyType,
  GetKyNhansByUserSchemaType,
  UpdateUserBodyType,
  USER_FIELDS
} from './entities/user.entity'

@Injectable()
export class UserRepo {
  constructor(private prismaService: PrismaService) { }

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: Omit<CreateUserBodyType, 'confirmPassword'>
  }): Promise<Omit<UserType, 'password'>> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById
      }
    })
  }

  update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: Omit<UpdateUserBodyType, 'confirmPassword'>
  }): Promise<Omit<UserType, 'password'>> {
    return this.prismaService.user.update({
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
  ): Promise<UserType> {
    return isHard
      ? this.prismaService.user.delete({
        where: {
          id
        }
      })
      : this.prismaService.user.update({
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

  async list(pagination: PaginationQueryType, customerId?: number) {
    const { where, orderBy } = parseQs(pagination.qs, USER_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
          ...where,
          ...(customerId ? { roleId: customerId } : {})
        }
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
          ...where,
          ...(customerId ? { roleId: customerId } : {})
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          gender: true,
          birthDate: true,
          status: true,
          avatar: true,
          coin: true,
          point: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: { id: true, name: true, description: true }
          }
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

  async getRanking(pagination: PaginationQueryType, customerId?: number) {
    // 👉 Kiểm tra & thêm sort:-point,status=ACTIVE nếu chưa có
    pagination.qs = pagination.qs || ''

    if (!pagination.qs.includes('sort:-point')) {
      pagination.qs = (pagination.qs ? pagination.qs + ',' : '') + 'sort:-point'
    }

    if (!pagination.qs.includes('status=ACTIVE')) {
      pagination.qs = (pagination.qs ? pagination.qs + ',' : '') + 'status=ACTIVE'
    }
    const { where, orderBy } = parseQs(pagination.qs, USER_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
          ...where,
          ...(customerId ? { roleId: customerId } : {})
        }
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
          ...where,
          ...(customerId ? { roleId: customerId } : {})
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          point: true
        },
        orderBy: orderBy ? [orderBy, { updatedAt: 'asc' }] : [{ updatedAt: 'asc' }],
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

  async getUserActiveList(pagination: PaginationQueryType) {
    const { where, orderBy } = parseQs(pagination.qs, USER_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.user.findMany({
        where: { deletedAt: null, ...where },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          gender: true,
          birthDate: true,
          status: true,
          avatar: true,
          coin: true,
          point: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: { id: true, name: true, description: true }
          }
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

  findById(id: number): Promise<Omit<UserType, 'password'> | null> {
    return this.prismaService.user.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        role: {
          select: { id: true, name: true, description: true }
        }
      }
    })
  }

  findByIdOrEmail(where: WhereUniqueUserType): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null
      },
      include: {
        role: {
          select: { id: true, name: true, description: true }
        }
      }
    })
  }

  getKyNhanList(
    userId: number
  ): Promise<Omit<GetKyNhansByUserSchemaType, 'password'> | null> {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
        deletedAt: null
      },
      include: {
        userKynhans: {
          where: { deletedAt: null },
          include: {
            motaKyNhan: true
          }
        }
      }
    })
  }
}
