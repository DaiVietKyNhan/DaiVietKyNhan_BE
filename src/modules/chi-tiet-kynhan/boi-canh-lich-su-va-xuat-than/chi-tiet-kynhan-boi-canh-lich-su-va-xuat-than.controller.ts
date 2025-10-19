import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanService } from './chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.service'
import {
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyDTO,
  CreateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO,
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanListResDTO,
  GetChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO,
  GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietDTO,
  GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanDTO,
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyDTO,
  UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO
} from './dto/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.zod-dto'

@ApiTags('ChiTietKyNhanBoiCanhLichSuVaSuuThan')
@ApiBearerAuth()
@Controller('chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than')
export class ChiTietKyNhanBoiCanhLichSuVaSuuThanController {
  constructor(private readonly chiTietKyNhanBoiCanhLichSuVaSuuThanService: ChiTietKyNhanBoiCanhLichSuVaSuuThanService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bối cảnh lịch sử và xuất thân của chi tiết kỳ nhân' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  @ZodSerializerDto(MessageResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.chiTietKyNhanBoiCanhLichSuVaSuuThanService.list(query)
  }

  @Get(':boiCanhLichSuVaSuuThanId')
  @ApiOperation({ summary: 'Lấy bối cảnh lịch sử và xuất thân theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy bối cảnh lịch sử và xuất thân thành công',
    type: GetChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bối cảnh lịch sử và xuất thân' })
  @ZodSerializerDto(GetChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO)
  findById(@Param() params: GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanDTO) {
    return this.chiTietKyNhanBoiCanhLichSuVaSuuThanService.findById(params.boiCanhLichSuVaSuuThanId)
  }

  @Get('chi-tiet/:chiTietKyNhanId')
  @ApiOperation({ summary: 'Lấy danh sách bối cảnh lịch sử và xuất thân theo ID chi tiết kỳ nhân' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bối cảnh lịch sử và xuất thân thành công',
    type: GetChiTietKyNhanBoiCanhLichSuVaSuuThanListResDTO
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
  @ZodSerializerDto(GetChiTietKyNhanBoiCanhLichSuVaSuuThanListResDTO)
  findByChiTietKyNhanId(@Param() params: GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanByChiTietDTO) {
    return this.chiTietKyNhanBoiCanhLichSuVaSuuThanService.findByChiTietKyNhanId(params.chiTietKyNhanId)
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới bối cảnh lịch sử và xuất thân' })
  @ApiResponse({
    status: 201,
    description: 'Tạo mới bối cảnh lịch sử và xuất thân thành công',
    type: CreateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO
  })
  @ApiResponse({ status: 409, description: 'Bối cảnh lịch sử và xuất thân đã tồn tại' })
  @ZodSerializerDto(CreateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO)
  create(@Body() body: CreateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyDTO, @ActiveUser('userId') userId: number) {
    return this.chiTietKyNhanBoiCanhLichSuVaSuuThanService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':boiCanhLichSuVaSuuThanId')
  @ApiOperation({ summary: 'Cập nhật bối cảnh lịch sử và xuất thân' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bối cảnh lịch sử và xuất thân thành công',
    type: UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bối cảnh lịch sử và xuất thân' })
  @ApiResponse({ status: 409, description: 'Bối cảnh lịch sử và xuất thân đã tồn tại' })
  @ZodSerializerDto(UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanResDTO)
  update(
    @Body() body: UpdateChiTietKyNhanBoiCanhLichSuVaSuuThanBodyDTO,
    @Param() params: GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.chiTietKyNhanBoiCanhLichSuVaSuuThanService.update({
      data: body,
      id: params.boiCanhLichSuVaSuuThanId,
      updatedById: userId
    })
  }

  @Delete(':boiCanhLichSuVaSuuThanId')
  @ApiOperation({ summary: 'Xóa bối cảnh lịch sử và xuất thân (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Xóa bối cảnh lịch sử và xuất thân thành công',
    type: MessageResDTO
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bối cảnh lịch sử và xuất thân' })
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetParamsChiTietKyNhanBoiCanhLichSuVaSuuThanDTO, @ActiveUser('userId') userId: number) {
    return this.chiTietKyNhanBoiCanhLichSuVaSuuThanService.delete({
      id: params.boiCanhLichSuVaSuuThanId,
      deletedById: userId
    })
  }
}
