import { parseQs } from '@/common/utils/qs-parser'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  USER_REWARD_HISTORY_FIELDS,
  UserRewardHistoryType
} from './entities/user-reward-history.entity'

@Injectable()
export class UserRewardHistoryRepo {
  constructor(private prisma: PrismaService) {}

  async create(params: {
    data: Prisma.UserRewardHistoryCreateInput
    createdById: number
  }) {
    const { data, createdById } = params
    return this.prisma.userRewardHistory.create({
      data: {
        ...data,
        createdBy: { connect: { id: createdById } }
      },
      include: {
        reward: true,
        user: true
      }
    })
  }

  async findByUserId(userId: number) {
    return this.prisma.userRewardHistory.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        reward: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async list(pagination: PaginationQueryType) {
    const { where: parsedWhere, orderBy: parsedOrderBy } = parseQs(
      pagination.qs,
      USER_REWARD_HISTORY_FIELDS
    )

    // Initialize where clause if undefined
    const whereClause: any = parsedWhere || {}

    // Handle reward.code filter (relation field)
    // Extract reward.code or code field and build nested filter
    let rewardCodeFilter: any = {}
    if (whereClause['reward.code']) {
      // If explicit reward.code is provided
      rewardCodeFilter = {
        reward: {
          code: whereClause['reward.code']
        }
      }
      delete whereClause['reward.code']
    } else if (whereClause.code !== undefined) {
      // If only 'code' is provided, filter by reward.code
      // because in UserRewardHistory, code field is usually the same as reward.code
      rewardCodeFilter = {
        reward: {
          code: whereClause.code
        }
      }
      delete whereClause.code
    }

    // Build where clause - merge all filters
    // If there are other filters on reward relation, we need to merge them
    const where: any = {
      deletedAt: null,
      ...whereClause
    }

    // Merge reward filters if rewardCodeFilter exists
    if (Object.keys(rewardCodeFilter).length > 0) {
      if (where.reward) {
        // If reward filter already exists, merge them
        where.reward = {
          ...where.reward,
          ...rewardCodeFilter.reward
        }
      } else {
        // Otherwise, just add rewardCodeFilter
        where.reward = rewardCodeFilter.reward
      }
    }

    const skip = (pagination.currentPage - 1) * pagination.pageSize
    const take = pagination.pageSize

    const [total, data] = await Promise.all([
      this.prisma.userRewardHistory.count({
        where
      }),
      this.prisma.userRewardHistory.findMany({
        where,
        include: {
          reward: true,
          user: true
        },
        orderBy: parsedOrderBy || { createdAt: 'desc' },
        skip,
        take
      })
    ])

    return {
      total,
      data,
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      totalPage: Math.ceil(total / pagination.pageSize)
    }
  }

  getListUserRewardHisWithId(rewardId: number): Promise<UserRewardHistoryType[] | null> {
    return this.prisma.userRewardHistory.findMany({
      where: {
        rewardId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })
  }
}
