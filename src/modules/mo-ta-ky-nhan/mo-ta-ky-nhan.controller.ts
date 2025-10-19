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
  CreateMotaKyNhanBodyDTO,
  CreateMotaKyNhanResDTO,
  GetMotaKyNhanResDTO,
  GetParamsMotaKyNhanDTO,
  GetParamsMotaKyNhanIdDTO,
  UpdateMotaKyNhanBodyDTO,
  UpdateMotaKyNhanResDTO
} from 'src/modules/mo-ta-ky-nhan/dto/mo-ta-ky-nhan.zod-dto'

import { CloudinaryImageUploadConfig } from '@/3rdService/upload/cloudinary/multer.config'
import { FileInterceptor } from '@nestjs/platform-express'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { MotaKyNhanService } from './mo-ta-ky-nhan.service'

@Controller('mo-ta-ky-nhan')
@ApiBearerAuth()
export class MotaKyNhanController {
  constructor(private readonly kynhanService: MotaKyNhanService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.kynhanService.list(query)
  }

  @Get(':moTaKyNhanId')
  @ZodSerializerDto(GetMotaKyNhanResDTO)
  findById(@Param() params: GetParamsMotaKyNhanDTO) {
    return this.kynhanService.findById(params.moTaKyNhanId)
  }
  @Get('/kynhan/:kyNhanId')
  @ZodSerializerDto(GetMotaKyNhanResDTO)
  findBykyNhanId(@Param() params: GetParamsMotaKyNhanIdDTO) {
    return this.kynhanService.findByKyNhanId(params.kyNhanId)
  }

  @Post()
  @ZodSerializerDto(CreateMotaKyNhanResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() body: any,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    const payload: CreateMotaKyNhanBodyDTO = {
      ten: body.ten,
      danhHieu: body.danhHieu,
      namSinhNamMat: body.namSinhNamMat,
      queQuan: body.queQuan,
      xuatThan: body.xuatThan,
      khoiNghia: body.khoiNghia,
      nguoiDongHanh: body.nguoiDongHanh,
      phuQuan: body.phuQuan,
      chienCong: body.chienCong,
      dinhCao: body.dinhCao,
      ketCuc: body.ketCuc,
      imgUrl: null,
      kyNhanId: Number(body.kyNhanId)
    }
    return this.kynhanService.create({
      data: payload,
      createdById: userId,
      imgFile
    })
  }

  @Put(':moTaKyNhanId')
  @ZodSerializerDto(UpdateMotaKyNhanResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  update(
    @Body() body: any,
    @Param() params: GetParamsMotaKyNhanDTO,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    const payload: UpdateMotaKyNhanBodyDTO = {}
    if (body.ten) payload.ten = body.ten
    if (body.danhHieu) payload.danhHieu = body.danhHieu
    if (body.namSinhNamMat) payload.namSinhNamMat = body.namSinhNamMat
    if (body.queQuan) payload.queQuan = body.queQuan
    if (body.xuatThan) payload.xuatThan = body.xuatThan
    if (body.khoiNghia) payload.khoiNghia = body.khoiNghia
    if (body.nguoiDongHanh) payload.nguoiDongHanh = body.nguoiDongHanh
    if (body.phuQuan) payload.phuQuan = body.phuQuan
    if (body.chienCong) payload.chienCong = body.chienCong
    if (body.dinhCao) payload.dinhCao = body.dinhCao
    if (body.ketCuc) payload.ketCuc = body.ketCuc
    if (body.kyNhanId) payload.kyNhanId = +body.kyNhanId
    return this.kynhanService.update({
      data: payload,
      id: params.moTaKyNhanId,
      updatedById: userId,
      imgFile
    })
  }

  @Delete(':moTaKyNhanId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsMotaKyNhanDTO, @ActiveUser('userId') userId: number) {
    return this.kynhanService.delete({
      id: params.moTaKyNhanId,
      deletedById: userId
    })
  }
}
