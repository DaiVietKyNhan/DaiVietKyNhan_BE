import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateLandBodyDTO,
  CreateLandResDTO,
  GetLandResDTO,
  GetParamsLandDTO,
  UpdateLandBodyDTO,
  UpdateLandResDTO
} from 'src/modules/land/dto/land.zod-dto'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { LandService } from './land.service'

@Controller('land')
@ApiBearerAuth()
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.landService.list(query)
  }

  @Get(':landId')
  @ZodSerializerDto(GetLandResDTO)
  findById(@Param() params: GetParamsLandDTO) {
    return this.landService.findById(params.landId)
  }

  @Post()
  @ZodSerializerDto(CreateLandResDTO)
  create(@Body() body: CreateLandBodyDTO, @ActiveUser('userId') userId: number) {
    return this.landService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':landId')
  @ZodSerializerDto(UpdateLandResDTO)
  update(
    @Body() body: UpdateLandBodyDTO,
    @Param() params: GetParamsLandDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.landService.update({
      data: body,
      id: params.landId,
      updatedById: userId
    })
  }

  @Delete(':landId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsLandDTO, @ActiveUser('userId') userId: number) {
    return this.landService.delete({
      id: params.landId,
      deletedById: userId
    })
  }
}
