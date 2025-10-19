import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ChangePointUserLogService } from './change-point-user-log.service'
import {
  CreateChangePointUserLogBodyDTO,
  CreateChangePointUserLogResDTO,
  GetChangePointUserLogResDTO,
  GetParamsChangePointUserLogDTO,
  UpdateChangePointUserLogBodyDTO,
  UpdateChangePointUserLogResDTO
} from './dto/change-point-user-log.zod-dto'

@Controller('change-point-user-log')
@ApiBearerAuth()
export class ChangePointUserLogController {
  constructor(private readonly ChangePointUserLogService: ChangePointUserLogService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.ChangePointUserLogService.list(query)
  }

  @Get(':id')
  @ZodSerializerDto(GetChangePointUserLogResDTO)
  findById(@Param() params: GetParamsChangePointUserLogDTO) {
    return this.ChangePointUserLogService.findById(params.id)
  }

  @Post()
  @ZodSerializerDto(CreateChangePointUserLogResDTO)
  create(
    @Body() body: CreateChangePointUserLogBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.ChangePointUserLogService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':id')
  @ZodSerializerDto(UpdateChangePointUserLogResDTO)
  update(
    @Body() body: UpdateChangePointUserLogBodyDTO,
    @Param() params: GetParamsChangePointUserLogDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.ChangePointUserLogService.update({
      data: body,
      id: params.id,
      updatedById: userId
    })
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetParamsChangePointUserLogDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.ChangePointUserLogService.delete({
      id: params.id,
      deletedById: userId
    })
  }
}
