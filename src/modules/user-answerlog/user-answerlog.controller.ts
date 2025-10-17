import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateUserAnswerLogBodyDTO,
  CreateUserAnswerLogResDTO,
  GetParamsUserAnswerLogByQuestionIdDTO,
  GetUserAnswerLogResDTO,
  PassUserAnswerLogBodyDTO
} from 'src/modules/user-answerlog/dto/user-answerlog.zod-dto'

import { UserAnswerLogService } from './user-answerlog.service'

@Controller('user-answer-log')
@ApiBearerAuth()
export class UserAnswerLogController {
  constructor(private readonly answerService: UserAnswerLogService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.answerService.list(query)
  }

  @Get('check/:questionId')
  @ZodSerializerDto(GetUserAnswerLogResDTO)
  checkHasAnswered(
    @Param() params: GetParamsUserAnswerLogByQuestionIdDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.answerService.checkHasAnswered({
      userId: userId,
      questionId: params.questionId
    })
  }

  @Post('pass')
  @ZodSerializerDto(CreateUserAnswerLogResDTO)
  pass(@Body() body: PassUserAnswerLogBodyDTO, @ActiveUser('userId') userId: number) {
    return this.answerService.pass({
      data: body,
      createdById: userId
    })
  }

  @Post()
  @ZodSerializerDto(CreateUserAnswerLogResDTO)
  create(@Body() body: CreateUserAnswerLogBodyDTO, @ActiveUser('userId') userId: number) {
    return this.answerService.create({
      data: body,
      createdById: userId
    })
  }
}
