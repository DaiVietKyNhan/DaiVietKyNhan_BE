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
        role: true
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
}
