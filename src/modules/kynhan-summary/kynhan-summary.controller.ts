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
  CreateKyNhanSummaryBodyDTO,
  CreateKyNhanSummaryResDTO,
  GetKyNhanSummaryByQuesIdParamsDTO,
  GetKyNhanSummaryParamsDTO,
  GetKyNhanSummaryResDTO,
  UpdateKyNhanSummaryBodyDTO,
  UpdateKyNhanSummaryResDTO
} from './dto/kynhan-summary.zod-dto'
import { KyNhanSummaryService } from './kynhan-summary.service'

@Controller('kynhan-summary')
@ApiBearerAuth()
export class KyNhanSummaryController {
  constructor(private readonly kyNhanSummaryService: KyNhanSummaryService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.kyNhanSummaryService.list(query)
  }

  @Get(':kyNhanSummaryId')
  @ZodSerializerDto(GetKyNhanSummaryResDTO)
  findById(@Param() params: GetKyNhanSummaryParamsDTO) {
    return this.kyNhanSummaryService.findById(params.kyNhanSummaryId)
  }

  @Get('question/questionId')
  @ZodSerializerDto(GetKyNhanSummaryResDTO)
  findByQuestionId(@Param() params: GetKyNhanSummaryByQuesIdParamsDTO) {
    return this.kyNhanSummaryService.findByQuestionId(params.questionId)
  }

  @Post()
  @ZodSerializerDto(CreateKyNhanSummaryResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() body: any,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    // All form-data fields are strings; convert to proper types expected by CreateKyNhanSummaryBodySchema
    const payload: CreateKyNhanSummaryBodyDTO = {
      kyNhanId: typeof body.kyNhanId === 'string' ? Number(body.kyNhanId) : body.kyNhanId,
      questionId:
        body.questionId !== undefined
          ? typeof body.questionId === 'string'
            ? Number(body.questionId)
            : body.questionId
          : null,
      summary: body.summary ?? null,
      imgUrl: body.imgUrl ?? null
    }

    return this.kyNhanSummaryService.create({
      data: payload,
      createdById: userId,
      imgFile
    })
  }

  @Put(':kyNhanSummaryId')
  @ZodSerializerDto(UpdateKyNhanSummaryResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  update(
    @Body() body: any,
    @Param() params: GetKyNhanSummaryParamsDTO,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    // Coerce fields from form-data (strings) to proper types for partial update
    const payload: UpdateKyNhanSummaryBodyDTO = {}
    if (body.kyNhanId !== undefined) {
      payload.kyNhanId =
        typeof body.kyNhanId === 'string' ? Number(body.kyNhanId) : body.kyNhanId
    }
    if (body.questionId !== undefined) {
      payload.questionId =
        body.questionId !== null
          ? typeof body.questionId === 'string'
            ? Number(body.questionId)
            : body.questionId
          : null
    }
    if (body.summary !== undefined) payload.summary = body.summary ?? null
    if (body.imgUrl !== undefined) payload.imgUrl = body.imgUrl ?? null

    return this.kyNhanSummaryService.update({
      data: payload,
      id: params.kyNhanSummaryId,
      updatedById: userId,
      imgFile
    })
  }

  @Delete(':kyNhanSummaryId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetKyNhanSummaryParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.kyNhanSummaryService.delete({
      id: params.kyNhanSummaryId,
      deletedById: userId
    })
  }
}
