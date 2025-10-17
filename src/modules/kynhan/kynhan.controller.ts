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
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateKyNhanBodyDTO,
  CreateKyNhanResDTO,
  GetKyNhanResDTO,
  GetParamsKyNhanDTO,
  UpdateKyNhanBodyDTO,
  UpdateKyNhanResDTO
} from 'src/modules/kynhan/dto/kynhan.zod-dto'

import { CloudinaryImageUploadConfig } from '@/3rdService/upload/cloudinary/multer.config'
import { FileInterceptor } from '@nestjs/platform-express'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { KynhanService } from './kynhan.service'

@Controller('kynhan')
@ApiBearerAuth()
export class KynhanController {
  constructor(private readonly kynhanService: KynhanService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.kynhanService.list(query)
  }

  @Get(':kyNhanId')
  @ZodSerializerDto(GetKyNhanResDTO)
  findById(@Param() params: GetParamsKyNhanDTO) {
    return this.kynhanService.findById(params.kyNhanId)
  }

  @Post()
  @ZodSerializerDto(CreateKyNhanResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() body: any,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    const payload: CreateKyNhanBodyDTO = {
      name: body.name,
      thoiKy: body.thoiKy,
      chienCong: body.chienCong,
      landId: Number(body.landId),
      imgUrl: '',
      active: body.active === 'true' || body.active === true ? true : false
    }
    return this.kynhanService.create({
      data: payload,
      createdById: userId,
      imgFile
    })
  }

  @Put(':kyNhanId')
  @ZodSerializerDto(UpdateKyNhanResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  update(
    @Body() body: any,
    @Param() params: GetParamsKyNhanDTO,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    const payload: UpdateKyNhanBodyDTO = {}
    if (body.name !== undefined) payload.name = body.name
    if (body.thoiKy !== undefined) payload.thoiKy = body.thoiKy
    if (body.chienCong !== undefined) payload.chienCong = body.chienCong
    if (body.active !== undefined)
      payload.active = body.active === 'true' || body.active === true ? true : false
    if (body.imgUrl !== undefined) payload.imgUrl = body.imgUrl
    if (body.landId !== undefined) payload.landId = Number(body.landId)
    return this.kynhanService.update({
      data: payload,
      id: params.kyNhanId,
      updatedById: userId,
      imgFile
    })
  }

  @Delete(':kyNhanId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsKyNhanDTO, @ActiveUser('userId') userId: number) {
    return this.kynhanService.delete({
      id: params.kyNhanId,
      deletedById: userId
    })
  }
}
