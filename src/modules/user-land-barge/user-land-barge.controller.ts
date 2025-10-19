import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateUserLandBargeListResDTO,
  GetUserLandBargesResDTO
} from 'src/modules/user-land-barge/dto/user-land-barge.zod-dto'

import { UserLandBargeService } from './user-land-barge.service'

@Controller('user-land-barge')
@ApiBearerAuth()
export class UserLandBargeController {
  constructor(private readonly UserLandBargeService: UserLandBargeService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.UserLandBargeService.list(query)
  }

  @Get('user')
  @ZodSerializerDto(GetUserLandBargesResDTO)
  getLandByUser(@ActiveUser('userId') userId: number) {
    return this.UserLandBargeService.getLandByUserId(userId)
  }

  @Post('user')
  @ZodSerializerDto(CreateUserLandBargeListResDTO)
  createListForUser(@ActiveUser('userId') userId: number) {
    return this.UserLandBargeService.createListForUser({
      userId: userId
    })
  }
}
