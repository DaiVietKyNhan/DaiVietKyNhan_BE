import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateAttendanceConfigBodyDTO,
  CreateAttendanceConfigResDTO,
  GetAttendanceConfigResDTO,
  GetParamsAttendanceConfigDTO,
  UpdateAttendanceConfigBodyDTO,
  UpdateAttendanceConfigResDTO
} from 'src/modules/attendence-config/dto/attendence-config.zod-dto'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AttendenceConfigService } from './attendence-config.service'

@Controller('atttendence-config')
@ApiBearerAuth()
export class AttendenceConfigController {
  constructor(private readonly atttendenceConfigService: AttendenceConfigService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.atttendenceConfigService.list(query)
  }

  @Get(':attendenceConfigId')
  @ZodSerializerDto(GetAttendanceConfigResDTO)
  findById(@Param() params: GetParamsAttendanceConfigDTO) {
    return this.atttendenceConfigService.findById(params.attendenceConfigId)
  }

  @Post()
  @ZodSerializerDto(CreateAttendanceConfigResDTO)
  create(
    @Body() body: CreateAttendanceConfigBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':attendenceConfigId')
  @ZodSerializerDto(UpdateAttendanceConfigResDTO)
  update(
    @Body() body: UpdateAttendanceConfigBodyDTO,
    @Param() params: GetParamsAttendanceConfigDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.update({
      data: body,
      id: params.attendenceConfigId,
      updatedById: userId
    })
  }

  @Delete(':attendenceConfigId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetParamsAttendanceConfigDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.atttendenceConfigService.delete({
      id: params.attendenceConfigId,
      deletedById: userId
    })
  }
}
