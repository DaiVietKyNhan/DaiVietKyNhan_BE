import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateUserLandBargeBodyType,
  UpdateUserLandBargeBodyType,
  UserLandBarge_FIELDS,
  UserLandBargeType,
  UserLandBargeWithLandBargeSchemaType
} from './entities/user-land-barge.entity'

@Injectable()
export class UserLandBargeRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateUserLandBargeBodyType
  }): Promise<UserLandBargeType> {
    return this.prismaService.userLandBarge.create({
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
    data: UpdateUserLandBargeBodyType
  }): Promise<UserLandBargeType> {
    return this.prismaService.userLandBarge.update({
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
  ): Promise<UserLandBargeType> {
    return isHard
      ? this.prismaService.userLandBarge.delete({
          where: {
            id
          }
        })
      : this.prismaService.userLandBarge.update({
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
    const { where, orderBy } = parseQs(pagination.qs, UserLandBarge_FIELDS)

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [totalItems, data] = await Promise.all([
      this.prismaService.userLandBarge.count({
        where: { deletedAt: null, ...where }
      }),
      this.prismaService.userLandBarge.findMany({
        where: { deletedAt: null, ...where },
        include: { landBarge: true },
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

  findById(id: number): Promise<UserLandBargeType | null> {
    return this.prismaService.userLandBarge.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: { landBarge: true }
    })
  }

  /**
   * Create or get UserLandBarge
   * If exists, return existing record
   * If not exists, create with status: false
   */
  async createOrGet({
    userId,
    landBargeId,
    createdById
  }: {
    userId: number
    landBargeId: number
    createdById?: number | null
  }): Promise<UserLandBargeType> {
    // Check if already exists
    const existing = await this.findByUserIdAndLandId(userId, landBargeId)

    if (existing) {
      return existing
    }

    // Create new with status: false
    return this.prismaService.userLandBarge.create({
      data: {
        userId,
        landBargeId,
        status: false,
        createdById: createdById ?? userId
      },
      include: { landBarge: true }
    })
  }

  async createOrUpdateWithUserIdAndListLandId({
    userId,
    landIds
  }: {
    userId: number
    landIds: number[]
  }): Promise<UserLandBargeType[]> {
    const results: UserLandBargeType[] = []

    for (let i = 0; i < landIds.length; i++) {
      const landId = landIds[i]
      // First item is unlocked (true), others are locked (false)
      const status = false

      // Check if already exists
      const existing = await this.findByUserIdAndLandId(userId, landId)

      if (existing) {
        // Update existing record
        const updated = await this.prismaService.userLandBarge.update({
          where: { id: existing.id },
          data: {
            status,
            updatedById: userId
          },
          include: { landBarge: true }
        })
        results.push(updated)
      } else {
        // Create new record
        const created = await this.prismaService.userLandBarge.create({
          data: {
            userId,
            landBargeId: landId,
            status,
            createdById: userId
          },
          include: { landBarge: true }
        })
        results.push(created)
      }
    }

    return results
  }

  findByUserIdAndLandId(
    userId: number,
    landId: number
  ): Promise<UserLandBargeType | null> {
    return this.prismaService.userLandBarge.findFirst({
      where: {
        userId,
        landBargeId: landId,
        deletedAt: null
      }
    })
  }

  getByUser(userId: number): Promise<UserLandBargeWithLandBargeSchemaType[]> {
    return this.prismaService.userLandBarge.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        landBarge: {
          include: {
            land: true
          }
        }
      },
      orderBy: {
        landBarge: {
          land: {
            order: 'asc'
          }
        }
      }
    })
  }

  async updateStatusByUserIdAndLandId({
    userId,
    landId,
    status,
    updatedById
  }: {
    userId: number
    landId: number
    status: boolean
    updatedById?: number
  }): Promise<UserLandBargeType | null> {
    // Find landBarge by landId
    const landBarge = await this.prismaService.landBarge.findFirst({
      where: {
        landId,
        deletedAt: null
      }
    })

    if (!landBarge) {
      return null
    }

    // Find and update userLandBarge by userId and landBargeId
    const userLandBarge = await this.prismaService.userLandBarge.findFirst({
      where: {
        userId,
        landBargeId: landBarge.id,
        deletedAt: null
      }
    })

    if (!userLandBarge) {
      return null
    }

    // Update status
    return this.prismaService.userLandBarge.update({
      where: {
        id: userLandBarge.id
      },
      data: {
        status,
        updatedById: updatedById ?? userId
      },
      include: {
        landBarge: true
      }
    })
  }
}
