import { AuthenticationGuard } from '@/common/guards/authentication.guard'
import { ActiveUser } from '@/common/decorators/active-user.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateMediaBodyDTO, QueryMediaDTO, UpdateMediaBodyDTO, BulkCreateMediaBodyDTO, BulkCreateMediaResDTO } from './dto'
import { MediaType } from './entities/media.entities'
import { MediaService } from './media.service'

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo media mới' })
  @ApiResponse({ status: 201, description: 'Tạo media thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createMediaDto: CreateMediaBodyDTO, @ActiveUser('userId') userId: number) {
    return this.mediaService.create(createMediaDto, userId)
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Upload nhiều media cho thư viện ảnh' })
  @ApiResponse({ status: 201, description: 'Upload nhiều media thành công', type: BulkCreateMediaResDTO })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ZodSerializerDto(BulkCreateMediaResDTO)
  bulkCreate(@Body() bulkCreateDto: BulkCreateMediaBodyDTO, @ActiveUser('userId') userId: number) {
    return this.mediaService.bulkCreate(bulkCreateDto, userId)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách media' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findAll(@Query() query: QueryMediaDTO) {
    return this.mediaService.findAll(query)
  }

  @Get('chitiet/:chiTietId')
  @ApiOperation({ summary: 'Lấy media theo ID chi tiết kỳ nhân' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
  findByChiTietId(@Param('chiTietId', ParseIntPipe) chiTietId: number) {
    return this.mediaService.findByChiTietId(chiTietId)
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy media theo loại' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findByType(@Param('type') type: MediaType) {
    return this.mediaService.findByType(type)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin media theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOneWithResponse(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin media' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaBodyDTO
  ) {
    return this.mediaService.update(id, updateMediaDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa media' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
  remove(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number) {
    return this.mediaService.remove(id, userId)
  }

  @Delete('chitiet/:chiTietId')
  @ApiOperation({ summary: 'Xóa tất cả media của chi tiết kỳ nhân' })
  @ApiResponse({ status: 200, description: 'Xóa tất cả media thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
  deleteByChiTietId(@Param('chiTietId', ParseIntPipe) chiTietId: number, @ActiveUser('userId') userId: number) {
    return this.mediaService.deleteByChiTietId(chiTietId, userId)
  }
}
