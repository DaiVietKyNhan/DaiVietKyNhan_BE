import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'

import { ApiBearerAuth } from '@nestjs/swagger'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

import { IsPublic } from '@/common/decorators/auth.decorator'
import {
  CreateSystemConfigDTO,
  CreateSystemConfigResDTO,
  GetParamsByActiveSystemConfigDTO,
  GetParamsSystemConfigDTO,
  GetSystemConfigDTO,
  GetSystemConfigWithAmountUserDTO,
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

  @Get('active/:isActive')
  @ZodSerializerDto(GetSystemConfigWithAmountUserDTO)
  @IsPublic()
  findByActiveWithAmountUser(@Param() params: GetParamsByActiveSystemConfigDTO) {
    return this.systemConfigService.findByActiveWithAmountUser(params.isActive)
  }

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
