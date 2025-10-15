import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  GetParamsIdOrEmailDTO,
  GetParamsUserDTO,
  GetUserWithRoleResDTO,
  UpdateUserBodyDTO,
  UpdateUserResDTO
} from './dto/user.zod-dto'
import { UserService } from './user.service'

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.userService.list(query)
  }

  @Get('user-list')
  @ZodSerializerDto(PaginationResponseSchema)
  getUserActiveList(@Query() query: PaginationQueryDTO) {
    return this.userService.getUserList(query)
  }

  @Get(':identifier')
  @ZodSerializerDto(GetUserWithRoleResDTO)
  findById(@Param() params: GetParamsIdOrEmailDTO) {
    return this.userService.findByIdOrEmail(params.identifier)
  }

  @Post()
  @ZodSerializerDto(CreateUserResDTO)
  create(@Body() body: CreateUserBodyDTO, @ActiveUser('userId') userId: number) {
    return this.userService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':userId')
  @ZodSerializerDto(UpdateUserResDTO)
  update(
    @Body() body: UpdateUserBodyDTO,
    @Param() params: GetParamsUserDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.userService.update({
      data: body,
      id: params.userId,
      updatedById: userId
    })
  }

  @Delete(':userId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsUserDTO, @ActiveUser('userId') userId: number) {
    return this.userService.delete({
      id: params.userId,
      deletedById: userId
    })
  }
}
