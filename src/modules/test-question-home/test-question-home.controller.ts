import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import {
  CreateTestQuestionHomeBodyDTO,
  CreateTestQuestionHomeResDTO,
  GetTestQuestionHomeParamsDTO,
  GetTestQuestionHomeResDTO,
  UpdateTestQuestionHomeBodyDTO,
  UpdateTestQuestionHomeResDTO
} from './dto/test-question-home.zod-dto'
import { TestQuestionHomeService } from './test-question-home.service'

@Controller('test-question-home')
@ApiBearerAuth()
export class TestQuestionHomeController {
  constructor(private readonly atttendenceConfigService: TestQuestionHomeService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.atttendenceConfigService.list(query)
  }

  @Get(':testQuestionHomeId')
  @ZodSerializerDto(GetTestQuestionHomeResDTO)
  findById(@Param() params: GetTestQuestionHomeParamsDTO) {
    return this.atttendenceConfigService.findById(params.testQuestionHomeId)
  }

  @Post()
  @ZodSerializerDto(CreateTestQuestionHomeResDTO)
  create(
    @Body() body: CreateTestQuestionHomeBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':testQuestionHomeId')
  @ZodSerializerDto(UpdateTestQuestionHomeResDTO)
  update(
    @Body() body: UpdateTestQuestionHomeBodyDTO,
    @Param() params: GetTestQuestionHomeParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.update({
      data: body,
      id: params.testQuestionHomeId,
      updatedById: userId
    })
  }

  @Delete(':testQuestionHomeId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetTestQuestionHomeParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.delete({
      id: params.testQuestionHomeId,
      deletedById: userId
    })
  }
}
