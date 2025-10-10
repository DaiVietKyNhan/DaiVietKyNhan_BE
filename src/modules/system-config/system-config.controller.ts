import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'

import { ApiBearerAuth } from '@nestjs/swagger'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

import {
  CreateSystemConfigDTO,
  CreateSystemConfigResDTO,
  GetParamsSystemConfigDTO,
  GetSystemConfigDTO,
  UpdateSystemConfigDTO,
  UpdateSystemConfigResDTO
} from './dto/system-config.zod-dto'
import { SystemConfigService } from './system-config.service'

@Controller('system-config')
@ApiBearerAuth()
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.systemConfigService.list(query)
  }

  // @Get(':date')
  // @ZodSerializerDto(GetSystemConfigDTO)
  // findByUser(
  //   @Param() params: GetParamsByDateSystemConfigDTO,
  //   @ActiveUser('userId') userId: number
  // ) {
  //   return this.systemConfigService.findByUser(
  //     userId,
  //     params.date ? new Date(params.date) : new Date()
  //   )
  // }
  @Get(':systemConfigId')
  @ZodSerializerDto(GetSystemConfigDTO)
  findById(@Param() params: GetParamsSystemConfigDTO) {
    console.log('don e')

    return this.systemConfigService.findById(params.systemConfigId)
  }

  @Post()
  @ZodSerializerDto(CreateSystemConfigResDTO)
  create(@Body() body: CreateSystemConfigDTO, @ActiveUser('userId') userId: number) {
    return this.systemConfigService.create({
      createdById: userId,
      data: body
    })
  }

  @Put(':systemConfigId')
  @ZodSerializerDto(UpdateSystemConfigResDTO)
  update(
    @Body() body: UpdateSystemConfigDTO,
    @Param() params: GetParamsSystemConfigDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.systemConfigService.update({
      data: body,
      id: params.systemConfigId,
      updatedById: userId
    })
  }

  @Delete(':systemConfigId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetParamsSystemConfigDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.systemConfigService.delete({
      id: params.systemConfigId,
      deletedById: userId
    })
  }
}
