import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import {
  CreateUserTestQuestionHomeBodyDTO,
  CreateUserTestQuestionHomeResDTO,
  GetUserTestQuestionHomeParamsDTO,
  GetUserTestQuestionHomeResDTO,
  UpdateUserTestQuestionHomeBodyDTO,
  UpdateUserTestQuestionHomeResDTO
} from './dto/user-test-question-home.zod-dto'
import { UserTestQuestionHomeService } from './user-test-question-home.service'

@Controller('user-test-question-home')
@ApiBearerAuth()
export class UserTestQuestionHomeController {
  constructor(private readonly atttendenceConfigService: UserTestQuestionHomeService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.atttendenceConfigService.list(query)
  }

  @Get(':testQuestionHomeId')
  @ZodSerializerDto(GetUserTestQuestionHomeResDTO)
  findById(@Param() params: GetUserTestQuestionHomeParamsDTO) {
    return this.atttendenceConfigService.findById(params.userTestQuestionHomeId)
  }

  @Post()
  @ZodSerializerDto(CreateUserTestQuestionHomeResDTO)
  create(
    @Body() body: CreateUserTestQuestionHomeBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':testQuestionHomeId')
  @ZodSerializerDto(UpdateUserTestQuestionHomeResDTO)
  update(
    @Body() body: UpdateUserTestQuestionHomeBodyDTO,
    @Param() params: GetUserTestQuestionHomeParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.update({
      data: body,
      id: params.userTestQuestionHomeId,
      updatedById: userId
    })
  }

  @Delete(':testQuestionHomeId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetUserTestQuestionHomeParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.delete({
      id: params.userTestQuestionHomeId,
      deletedById: userId
    })
  }
}
