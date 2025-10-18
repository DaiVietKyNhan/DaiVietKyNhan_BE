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
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateKyNhanBodyDTO,
  CreateKyNhanResDTO,
  CreateKyNhanCompleteBodyDTO,
  CreateKyNhanCompleteResDTO,
  GetKyNhanUserResDTO,
  GetParamsKyNhanDTO,
  UpdateKyNhanBodyDTO,
  UpdateKyNhanResDTO
} from 'src/modules/kynhan/dto/kynhan.zod-dto'

import { CloudinaryImageUploadConfig } from '@/3rdService/upload/cloudinary/multer.config'
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { KynhanService } from './kynhan.service'

@Controller('kynhan')
@ApiBearerAuth()
export class KynhanController {
  constructor(private readonly kynhanService: KynhanService) { }

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.kynhanService.list(query)
  }

  @Get(':kyNhanId')
  @ZodSerializerDto(GetKyNhanUserResDTO)
  findById(@Param() params: GetParamsKyNhanDTO) {
    return this.kynhanService.findById(params.kyNhanId)
  }

  @Get('list/user')
  @ZodSerializerDto(GetKyNhanUserResDTO)
  getListByUser(@ActiveUser('userId') userId: number) {
    return this.kynhanService.getListByUser(userId)
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

  @Post('full')
  @ZodSerializerDto(CreateKyNhanCompleteResDTO)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'imgUrl', maxCount: 1 },
    { name: 'chiTietImgUrl', maxCount: 1 },
    { name: 'thuVienAnh', maxCount: 10 }
  ], {
    ...CloudinaryImageUploadConfig,
    limits: {
      ...CloudinaryImageUploadConfig.limits,
      files: 12 // 2 single images + 10 library images
    }
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo kỳ nhân hoàn chỉnh với tất cả thông tin từ form' })
  @ApiResponse({
    status: 201,
    description: 'Tạo kỳ nhân hoàn chỉnh thành công. Nếu có file upload thất bại, sẽ được báo cáo trong uploadWarnings',
    type: CreateKyNhanCompleteResDTO
  })
  createFull(
    @Body() body: CreateKyNhanCompleteBodyDTO,
    @UploadedFiles() files: {
      imgUrl?: Express.Multer.File[],
      chiTietImgUrl?: Express.Multer.File[],
      thuVienAnh?: Express.Multer.File[]
    },
    @ActiveUser('userId') userId: number
  ) {
    return this.kynhanService.createComplete({
      data: body,
      createdById: userId,
      imgFile: files.imgUrl?.[0],
      chiTietImgFile: files.chiTietImgUrl?.[0],
      thuVienAnhFiles: files.thuVienAnh || []
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
