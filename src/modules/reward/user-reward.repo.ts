import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import { GetListUserRewardQueryType } from './dto/user-reward.zod-dto'
import {
  CreateUserRewardBodyType,
  UpdateUserRewardBodyType,
  USER_REWARD_FIELDS,
  UserRewardType
} from './entities/user-reward.entity'

@Injectable()
export class UserRewardRepo {
  constructor(private prismaService: PrismaService) { }

  async getListUserReward(query: GetListUserRewardQueryType) {
    const { rewardCode, status, ...pagination } = query
    const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(
      pagination.qs,
      USER_REWARD_FIELDS
    )
    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = Number(pagination.pageSize) || 10

    const where = {
      ...parsedWhere,
      deletedAt: null as Date | null,
      ...(rewardCode ? { reward: { code: rewardCode } } : {}),
      ...(status ? { status } : {})
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.userReward.count({ where }),
      this.prismaService.userReward.findMany({
        where,
        include: {
          reward: true,
          user: true
        },
        orderBy: parsedOrderBy || { createdAt: 'desc' },
        skip: skip || 0,
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

  list(pagination: PaginationQueryType) {
    const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(
      pagination.qs,
      USER_REWARD_FIELDS
    )
    const skip = (pagination.currentPage - 1) * pagination.pageSize

    return this.prismaService.userReward.findMany({
      where: {
        ...parsedWhere,
        deletedAt: null
      },
      include: {
        reward: true
      },
      orderBy: parsedOrderBy || { createdAt: 'desc' },
      skip: skip || 0,
      take: Number(pagination.pageSize) || 10
    })
  }

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateUserRewardBodyType
  }): Promise<UserRewardType> {
    return this.prismaService.userReward.create({
      data: {
        ...data,
        createdById
      },
      include: {
        reward: true
      }
    })
  }

  findMany({
    pagination,
    where,
    orderBy
  }: {
    pagination: PaginationQueryType
    where?: any
    orderBy?: any
  }) {
    const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(
      pagination.qs,
      USER_REWARD_FIELDS
    )
    const skip = (pagination.currentPage - 1) * pagination.pageSize

    return this.prismaService.userReward.findMany({
      where: {
        ...parsedWhere,
        ...where,
        deletedAt: null
      },
      include: {
        reward: true
      },
      orderBy: parsedOrderBy || orderBy || { createdAt: 'desc' },
      skip,
      take: pagination.pageSize
    })
  }

  findManyCount({ where }: { where?: any }) {
    return this.prismaService.userReward.count({
      where: {
        ...where,
        deletedAt: null
      }
    })
  }

  findUnique({ id }: { id: number }) {
    return this.prismaService.userReward.findUnique({
      where: { id: Number(id) },
      include: {
        reward: true
      }
    })
  }

  findByUserAndReward({ userId, rewardId }: { userId: number; rewardId: number }) {
    return this.prismaService.userReward.findUnique({
      where: {
        userId_rewardId: {
          userId,
          rewardId
        }
      },
      include: {
        reward: true
      }
    })
  }

  findByUserAndCode({ userId, code }: { userId: number; code: string }) {
    return this.prismaService.userReward.findFirst({
      where: {
        userId,
        code,
        deletedAt: null
      },
      include: {
        reward: true
      }
    })
  }

  update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateUserRewardBodyType
    updatedById: number
  }) {
    return this.prismaService.userReward.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedById
      },
      include: {
        reward: true
      }
    })
  }

  upsert({
    userId,
    rewardId,
    data,
    createdById,
    updatedById
  }: {
    userId: number
    rewardId: number
    data: CreateUserRewardBodyType
    createdById: number
    updatedById: number
  }) {
    return this.prismaService.userReward.upsert({
      where: {
        userId_rewardId: {
          userId,
          rewardId
        }
      },
      create: {
        ...data,
        userId,
        rewardId,
        createdById
      },
      update: {
        ...data,
        updatedById
      },
      include: {
        reward: true
      }
    })
  }

  delete({ id, deletedById }: { id: number; deletedById: number }) {
    return this.prismaService.userReward.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
        deletedById
      }
    })
  }

  findByUserId(userId: number) {
    return this.prismaService.userReward.findMany({
      where: {
        userId,
        // status: {
        //   not: 'CLAIMED'
        // },
        deletedAt: null,
        reward: {
          type: {
            in: ['POINT', 'COIN'] // Chỉ lấy POINT và COIN, bỏ CODE
          }
        }
      },
      include: {
        reward: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  findByUserIdAndStatus(userId: number, status: 'PENDING' | 'COMPLETED' | 'CLAIMED' | 'CANCELLED') {
    return this.prismaService.userReward.findMany({
      where: {
        userId,
        status,
        deletedAt: null,
        reward: {
          type: {
            in: ['POINT', 'COIN'] // Chỉ lấy rewards có type POINT và COIN, loại bỏ CODE
          }
        }
      },
      include: {
        reward: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  findByUserIdAndCodeType(userId: number) {
    return this.prismaService.userReward.findMany({
      where: {
        userId,
        deletedAt: null,
        reward: {
          type: 'CODE' // Chỉ lấy rewards có type CODE
        }
      },
      include: {
        reward: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  countUserRewardsByRewardId(rewardId: number) {
    return this.prismaService.userReward.count({
      where: {
        rewardId,
        status: 'COMPLETED',
        deletedAt: null
      }
    })
  }

  findRewardByUserRewardId(userRewardId: number) {
    return this.prismaService.userReward.findUnique({
      where: { id: userRewardId },
      include: {
        reward: {
          select: {
            type: true
          }
        }
      }
    })
  }
}
