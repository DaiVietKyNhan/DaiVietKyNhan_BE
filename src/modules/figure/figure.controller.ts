import { CloudinaryImageUploadConfig } from '@/3rdService/upload/cloudinary/multer.config'
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
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { MessageResDTO } from 'src/shared/dtos/response.dto'
import {
  CreateFigureResDTO,
  GetFigureParamsDTO,
  GetFigureResDTO,
  UpdateFigureResDTO
} from './dto/figure.zod-dto'
import { FigureService } from './figure.service'

@Controller('figure')
@ApiBearerAuth()
export class FigureController {
  constructor(private readonly figureService: FigureService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.figureService.list(query)
  }

  @Get(':figureId')
  @ZodSerializerDto(GetFigureResDTO)
  findById(@Param() params: GetFigureParamsDTO) {
    return this.figureService.findById(params.figureId)
  }

  @Post('user/:figureId')
  @ZodSerializerDto(MessageResDTO)
  addFigureToUser(
    @Param() params: GetFigureParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.figureService.addFigureToUser(params.figureId, userId)
  }

  @Post()
  @ZodSerializerDto(CreateFigureResDTO)
  @UseInterceptors(FileInterceptor('imageUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  create(
    @Body() body: any,
    @ActiveUser('userId') userId: number,
    @UploadedFile() imgFile: Express.Multer.File
  ) {
    return this.figureService.create({
      data: body,
      createdById: userId,
      imgFile
    })
  }

  @Put(':figureId')
  @ZodSerializerDto(UpdateFigureResDTO)
  @UseInterceptors(FileInterceptor('imageUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  update(
    @Body() body: any,
    @Param() params: GetFigureParamsDTO,
    @ActiveUser('userId') userId: number,
    @UploadedFile() imgFile: Express.Multer.File
  ) {
    return this.figureService.update({
      data: body,
      id: params.figureId,
      updatedById: userId,
      imgFile
    })
  }

  @Delete(':figureId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetFigureParamsDTO, @ActiveUser('userId') userId: number) {
    return this.figureService.delete({
      id: params.figureId,
      deletedById: userId
    })
  }
}
