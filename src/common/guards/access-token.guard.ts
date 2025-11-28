import {
  REQUEST_ROLE_PERMISSIONS,
  REQUEST_USER_KEY
} from '@/common/constants/auth.constant'
import { HTTPMethod } from '@/common/constants/role.constant'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

// Các endpoint được phép truy cập ngay cả khi role inactive
const ROLE_INACTIVE_WHITELIST = [
  { path: '/auth/me', method: 'GET' },
  { path: '/auth/me', method: 'PUT' },
  { path: '/auth/refresh-token', method: 'POST' },
  { path: '/auth/change-password ', method: 'POST' },
  { path: '/auth/verified-email/:email', method: 'GET' },
  { path: '/auth/resend-verified-email/:email', method: 'POST' },
  { path: '/auth/reset-password', method: 'POST' }
]

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    // Extract và validate token
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // Check user permission
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)

      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('AccessToken không hợp lệ')
    }
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Thiếu AccessToken')
    }
    return accessToken
  }

  private async validateUserPermission(
    decodedAccessToken: AccessTokenPayload,
    request: any
  ): Promise<void> {
    const roleId: number = decodedAccessToken.roleId
    const path: string = request.route.path
    const method = request.method as keyof typeof HTTPMethod

    // Kiểm tra xem endpoint có trong whitelist không
    const isWhitelistedEndpoint = ROLE_INACTIVE_WHITELIST.some(
      (endpoint) => endpoint.path === path && endpoint.method === method
    )

    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
          // Không kiểm tra isActive cho endpoint trong whitelist
          ...(isWhitelistedEndpoint ? {} : { isActive: true })
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              path,
              method
            }
          }
        }
      })
      .catch(() => {
        throw new ForbiddenException('Bạn không có quyền truy cập tác vụ này')
      })

    // Đối với endpoint trong whitelist, chỉ cần role tồn tại, không cần permission
    if (isWhitelistedEndpoint) {
      request[REQUEST_ROLE_PERMISSIONS] = role
      return
    }

    const canAccess = role.permissions.length > 0
    if (!canAccess) {
      throw new ForbiddenException('Bạn không có quyền truy cập tác vụ này')
    }
    request[REQUEST_ROLE_PERMISSIONS] = role
  }
}
