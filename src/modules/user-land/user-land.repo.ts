import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateUserLandBodyType,
  UpdateUserLandBodyType,
  USERLAND_FIELDS,
  UserLandType
} from './entities/user-land.entity'

@Injectable()
export class UserLandRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateUserLandBodyType
  }): Promise<UserLandType> {
    return this.prismaService.userLand.create({
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
    data: UpdateUserLandBodyType
  }): Promise<UserLandType> {
    return this.prismaService.userLand.update({
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
  ): Promise<UserLandType> {
    return isHard
      ? this.prismaService.userLand.delete({
          where: {
            id
          }
        })
      : this.prismaService.userLand.update({
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
    const { where, orderBy } = parseQs(pagination.qs, USERLAND_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.userLand.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.userLand.findMany({
        where: { deletedAt: null, ...where },

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

  findById(id: number): Promise<UserLandType | null> {
    return this.prismaService.userLand.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: { land: true }
    })
  }

  findByUserIdAndLandId(userId: number, landId: number): Promise<UserLandType | null> {
    return this.prismaService.userLand.findFirst({
      where: {
        userId,
        landId,
        deletedAt: null
      }
    })
  }

  async createOrUpdateWithUserIdAndListLandId({
    userId,
    landIds
  }: {
    userId: number
    landIds: number[]
  }): Promise<UserLandType[]> {
    const results: UserLandType[] = []

    for (let i = 0; i < landIds.length; i++) {
      const landId = landIds[i]
      const status = i === 0 ? 'PENDING' : 'PENDING'

      // Check if already exists
      const existing = await this.findByUserIdAndLandId(userId, landId)

      if (existing) {
        // Update existing record
        // For first item, keep PENDING; for others, update to LOCKED
        const updated = await this.prismaService.userLand.update({
          where: { id: existing.id },
          data: {
            status,
            updatedById: userId
          }
        })
        results.push(updated)
      } else {
        // Create new record
        const created = await this.prismaService.userLand.create({
          data: {
            userId,
            landId,
            status,
            createdById: userId
          }
        })
        results.push(created)
      }
    }

    return results
  }

  getLandsByUserId(userId: number): Promise<UserLandType[]> {
    return this.prismaService.userLand.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: { land: true },
      orderBy: { id: 'asc' }
    })
  }
}
