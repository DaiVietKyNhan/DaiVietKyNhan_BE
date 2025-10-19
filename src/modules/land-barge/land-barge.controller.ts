import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { CloudinaryImageUploadConfig } from '@/3rdService/upload/cloudinary/multer.config'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import {
  CreateLandBargeResDTO,
  GetLandBargeParamsDTO,
  GetLandBargeResDTO,
  UpdateLandBargeResDTO
} from './dto/land-barge.zod-dto'
import { LandBargeService } from './land-barge.service'

@Controller('land-barge')
@ApiBearerAuth()
export class LandBargeController {
  constructor(private readonly LandBargeService: LandBargeService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.LandBargeService.list(query)
  }

  @Get(':landBargeId')
  @ZodSerializerDto(GetLandBargeResDTO)
  findById(@Param() params: GetLandBargeParamsDTO) {
    return this.LandBargeService.findById(params.landBargeId)
  }

  @Post()
  @ZodSerializerDto(CreateLandBargeResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() body: any,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    // All form-data fields are strings; convert to proper types expected by CreateLandBargeBodySchema
    const payload: any = {
      landId: typeof body.landId === 'string' ? Number(body.landId) : body.landId
    }

    return this.LandBargeService.create({
      data: payload,
      createdById: userId,
      imgFile
    })
  }

  @Put('landBargeId')
  @ZodSerializerDto(UpdateLandBargeResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  update(
    @Body() body: any,
    @Param() params: GetLandBargeParamsDTO,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    // Coerce fields from form-data (strings) to proper types for partial update
    const payload: any = {}
    if (body.landId !== undefined) {
      payload.landId = typeof body.landId === 'string' ? Number(body.landId) : body.landId
    }
    return this.LandBargeService.update({
      data: payload,
      id: params.landBargeId,
      updatedById: userId,
      imgFile
    })
  }

  @Delete('landBargeId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetLandBargeParamsDTO, @ActiveUser('userId') userId: number) {
    return this.LandBargeService.delete({
      id: params.landBargeId,
      deletedById: userId
    })
  }
}
