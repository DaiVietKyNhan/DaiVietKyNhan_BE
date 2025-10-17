import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateUserLandBodyDTO,
  CreateUserLandListResDTO,
  CreateUserLandResDTO,
  GetParamsUserLandDTO,
  GetUserLandResDTO,
  GetUserLandsResDTO,
  UpdateUserLandBodyDTO,
  UpdateUserLandResDTO
} from 'src/modules/user-land/dto/user-land.zod-dto'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { UserLandService } from './user-land.service'

@Controller('user-land')
@ApiBearerAuth()
export class UserLandController {
  constructor(private readonly userLandService: UserLandService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.userLandService.list(query)
  }

  @Get('user')
  @ZodSerializerDto(GetUserLandsResDTO)
  getLandByUser(@ActiveUser('userId') userId: number) {
    return this.userLandService.getLandByUserId(userId)
  }

  @Get(':userLandId')
  @ZodSerializerDto(GetUserLandResDTO)
  findById(@Param() params: GetParamsUserLandDTO) {
    return this.userLandService.findById(params.userLandId)
  }

  @Post('user')
  @ZodSerializerDto(CreateUserLandListResDTO)
  createListForUser(@ActiveUser('userId') userId: number) {
    return this.userLandService.createListForUser({
      userId: userId
    })
  }

  @Post()
  @ZodSerializerDto(CreateUserLandResDTO)
  create(@Body() body: CreateUserLandBodyDTO, @ActiveUser('userId') userId: number) {
    return this.userLandService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':userLandId')
  @ZodSerializerDto(UpdateUserLandResDTO)
  update(
    @Body() body: UpdateUserLandBodyDTO,
    @Param() params: GetParamsUserLandDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.userLandService.update({
      data: body,
      id: params.userLandId,
      updatedById: userId
    })
  }

  @Delete(':userLandId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsUserLandDTO, @ActiveUser('userId') userId: number) {
    return this.userLandService.delete({
      id: params.userLandId,
      deletedById: userId
    })
  }
}
