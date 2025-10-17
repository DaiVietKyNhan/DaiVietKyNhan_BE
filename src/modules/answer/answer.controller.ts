import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateAnswerBodyDTO,
  CreateAnswerResDTO,
  GetAnswerResDTO,
  GetParamsAnswerDTO,
  UpdateAnswerBodyDTO,
  UpdateAnswerResDTO
} from 'src/modules/answer/dto/answer.zod-dto'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AnswerService } from './answer.service'

@Controller('answer')
@ApiBearerAuth()
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.answerService.list(query)
  }

  @Get(':answerId')
  @ZodSerializerDto(GetAnswerResDTO)
  findById(@Param() params: GetParamsAnswerDTO) {
    return this.answerService.findById(params.answerId)
  }

  @Post()
  @ZodSerializerDto(CreateAnswerResDTO)
  create(@Body() body: CreateAnswerBodyDTO, @ActiveUser('userId') userId: number) {
    return this.answerService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':answerId')
  @ZodSerializerDto(UpdateAnswerResDTO)
  update(
    @Body() body: UpdateAnswerBodyDTO,
    @Param() params: GetParamsAnswerDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.answerService.update({
      data: body,
      id: params.answerId,
      updatedById: userId
    })
  }

  @Delete(':answerId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsAnswerDTO, @ActiveUser('userId') userId: number) {
    return this.answerService.delete({
      id: params.answerId,
      deletedById: userId
    })
  }
}
