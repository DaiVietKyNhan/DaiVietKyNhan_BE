import { Injectable } from '@nestjs/common'
import { PermissionType } from 'src/shared/models/shared-permission.model'
import { RoleType } from 'src/shared/models/shared-role.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

type UserIncludeRolePermissionsType = UserType & {
  role: RoleType & { permissions: PermissionType[] }
}
type UserIncludeRoleType = UserType & {
  role: RoleType
}

export type WhereUniqueUserType = { id: number } | { email: string }

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null
      }
    })
  }
  findUniqueIncludeRole(where: WhereUniqueUserType): Promise<UserIncludeRoleType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null
      },
      include: {
        role: true,
        figure: true,
        godProfile: true
      }
    })
  }

  findUniqueIncludeRolePermissions(
    where: WhereUniqueUserType
  ): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null
              }
            }
          }
        }
      }
    })
  }

  update(
    where: { id: number },
    data: Partial<UserType>
  ): Promise<UserIncludeRoleType | null> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null
      },
      data,
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null
              }
            }
          }
        }
      }
    })
  }

  countByRoleName(roleName: string): Promise<number> {
    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        role: {
          name: roleName
        }
      }
    })
  }
  addCoinByUserId({
    userId,
    amount
  }: {
    userId: number
    amount: number
  }): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data: {
        coin: {
          increment: amount
        }
      }
    })
  }

  minusCoinByUserId({
    userId,
    amount
  }: {
    userId: number
    amount: number
  }): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data: {
        coin: {
          decrement: amount
        }
      }
    })
  }

  updateUserPointHome(userId: number, pointTestHome: boolean): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data: {
        pointTestHome
      }
    })
  }
  updateUserById(userId: number, data: Partial<UserType>): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data
    })
  }

  addpointByUserId({ userId, amount }: { userId: number; amount: number }) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data: {
        point: {
          increment: amount
        }
      }
    })
  }

  minuspointByUserId({ userId, amount }: { userId: number; amount: number }) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data: {
        point: {
          decrement: amount
        }
      }
    })
  }

  minusHeart({ userId, amount }: { userId: number; amount: number }) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data: {
        heart: {
          decrement: amount
        }
      }
    })
  }
  addHeart({ userId, amount }: { userId: number; amount: number }) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null
      },
      data: {
        heart: {
          increment: amount
        }
      }
    })
  }

  // Connect KyNhanSummary relations to user, ignoring already-connected items
  async addKyNhanSummariesToUser(
    userId: number,
    summaryIds: number[]
  ): Promise<UserType | null> {
    if (!summaryIds?.length) return this.findUnique({ id: userId })

    const existing = await this.prismaService.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { userKyNhanSummaries: { select: { id: true } } }
    })

    const existingIds = new Set(existing?.userKyNhanSummaries.map((s) => s.id) ?? [])
    const toConnect = summaryIds.filter((id) => !existingIds.has(id))

    if (!toConnect.length) return this.findUnique({ id: userId })

    return this.prismaService.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        userKyNhanSummaries: {
          connect: toConnect.map((id) => ({ id }))
        }
      }
    })
  }

  // Connect KyNhan relations to user, ignoring already-connected items
  async addKynhansToUser(userId: number, kynhanIds: number[]): Promise<UserType | null> {
    if (!kynhanIds?.length) return this.findUnique({ id: userId })

    const existing = await this.prismaService.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { userKynhans: { select: { id: true } } }
    })

    const existingIds = new Set(existing?.userKynhans.map((s) => s.id) ?? [])
    const toConnect = kynhanIds.filter((id) => !existingIds.has(id))

    if (!toConnect.length) return this.findUnique({ id: userId })

    return this.prismaService.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        userKynhans: {
          connect: toConnect.map((id) => ({ id }))
        }
      }
    })
  }
}
