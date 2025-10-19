import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateQuestionBodyDTO,
  CreateQuestionResDTO,
  GetParamsQuestionDTO,
  GetQuestionResDTO,
  UpdateQuestionBodyDTO,
  UpdateQuestionResDTO
} from 'src/modules/question/dto/question.zod-dto'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { QuestionService } from './question.service'

@Controller('question')
@ApiBearerAuth()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.questionService.list(query)
  }

  @Get(':questionId')
  @ZodSerializerDto(GetQuestionResDTO)
  findById(@Param() params: GetParamsQuestionDTO) {
    return this.questionService.findById(params.questionId)
  }

  @Post()
  @ZodSerializerDto(CreateQuestionResDTO)
  create(@Body() body: CreateQuestionBodyDTO, @ActiveUser('userId') userId: number) {
    return this.questionService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':questionId')
  @ZodSerializerDto(UpdateQuestionResDTO)
  update(
    @Body() body: UpdateQuestionBodyDTO,
    @Param() params: GetParamsQuestionDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.questionService.update({
      data: body,
      id: params.questionId,
      updatedById: userId
    })
  }

  @Delete(':questionId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsQuestionDTO, @ActiveUser('userId') userId: number) {
    return this.questionService.delete({
      id: params.questionId,
      deletedById: userId
    })
  }
}
