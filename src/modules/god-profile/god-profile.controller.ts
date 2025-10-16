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

import { CloudinaryImageUploadConfig } from '@/3rdService/upload/cloudinary/multer.config'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import {
  CreateGodProfileResDTO,
  GetGodProfileParamsDTO,
  GetGodProfileResDTO,
  GetGodProfilesByUserResDTO,
  UpdateGodProfileResDTO
} from './dto/god-profile.zod-dto'
import { GodProfileService } from './god-profile.service'

@Controller('god-profile')
@ApiBearerAuth()
export class GodProfileController {
  constructor(private readonly godProfileService: GodProfileService) {}

  @Get()
  @ZodSerializerDto(PaginationResponseSchema)
  list(@Query() query: PaginationQueryDTO) {
    return this.godProfileService.list(query)
  }

  @Get('pointHome')
  @ZodSerializerDto(GetGodProfilesByUserResDTO)
  findGodByPoint(@ActiveUser('userId') userId: number) {
    return this.godProfileService.findGodByPoint(userId)
  }

  @Post('user-choice/:godProfileId')
  @ZodSerializerDto(CreateGodProfileResDTO)
  choiceGod(
    @ActiveUser('userId') userId: number,
    @Param() params: GetGodProfileParamsDTO
  ) {
    return this.godProfileService.choiceGod(userId, params.godProfileId)
  }

  @Get(':godProfileId')
  @ZodSerializerDto(GetGodProfileResDTO)
  findById(@Param() params: GetGodProfileParamsDTO) {
    return this.godProfileService.findById(params.godProfileId)
  }

  @Post()
  @ZodSerializerDto(CreateGodProfileResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        textEmotion: { type: 'string' },
        traitType: {
          type: 'string',
          enum: ['CHOLERIC', 'SANGUINE', 'MELANCHOLIC', 'PHLEGMATIC']
        },
        order: { type: 'number' },
        description: { type: 'string' },
        text_color: { type: 'string' },
        imgUrl: { type: 'string', format: 'binary' }
      }
    }
  })
  create(
    @Body() body: any,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    // All form-data fields are strings; convert to proper types expected by CreateGodProfileBodySchema
    const payload: any = {
      title: body.title,
      textEmotion: body.textEmotion,
      traitType: body.traitType,
      order: typeof body.order === 'string' ? Number(body.order) : body.order,
      description: body.description,
      text_color: body.text_color ?? null
    }

    return this.godProfileService.create({
      data: payload,
      createdById: userId,
      imgFile
    })
  }

  @Put(':godProfileId')
  @ZodSerializerDto(UpdateGodProfileResDTO)
  @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        textEmotion: { type: 'string' },
        traitType: {
          type: 'string',
          enum: ['CHOLERIC', 'SANGUINE', 'MELANCHOLIC', 'PHLEGMATIC']
        },
        order: { type: 'number' },
        description: { type: 'string' },
        text_color: { type: 'string' },
        imgUrl: { type: 'string', format: 'binary' }
      }
    }
  })
  update(
    @Body() body: any,
    @Param() params: GetGodProfileParamsDTO,
    @UploadedFile() imgFile: Express.Multer.File,
    @ActiveUser('userId') userId: number
  ) {
    // Coerce fields from form-data (strings) to proper types for partial update
    const payload: any = {}
    if (body.title !== undefined) payload.title = body.title
    if (body.textEmotion !== undefined) payload.textEmotion = body.textEmotion
    if (body.traitType !== undefined) payload.traitType = body.traitType
    if (body.order !== undefined)
      payload.order = typeof body.order === 'string' ? Number(body.order) : body.order
    if (body.description !== undefined) payload.description = body.description
    if (body.text_color !== undefined) payload.text_color = body.text_color ?? null

    return this.godProfileService.update({
      data: payload,
      id: params.godProfileId,
      updatedById: userId,
      imgFile
    })
  }

  @Delete(':godProfileId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetGodProfileParamsDTO, @ActiveUser('userId') userId: number) {
    return this.godProfileService.delete({
      id: params.godProfileId,
      deletedById: userId
    })
  }
}
