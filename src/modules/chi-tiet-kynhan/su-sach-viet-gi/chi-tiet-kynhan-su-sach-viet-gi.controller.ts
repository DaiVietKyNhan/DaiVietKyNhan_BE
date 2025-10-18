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
import { ChiTietKyNhanSuSachVietGiService } from './chi-tiet-kynhan-su-sach-viet-gi.service'
import {
    CreateChiTietKyNhanSuSachVietGiBodyDTO,
    CreateChiTietKyNhanSuSachVietGiResDTO,
    GetChiTietKyNhanSuSachVietGiListResDTO,
    GetChiTietKyNhanSuSachVietGiResDTO,
    GetParamsChiTietKyNhanSuSachVietGiByChiTietDTO,
    GetParamsChiTietKyNhanSuSachVietGiDTO,
    UpdateChiTietKyNhanSuSachVietGiBodyDTO,
    UpdateChiTietKyNhanSuSachVietGiResDTO
} from './dto/chi-tiet-kynhan-su-sach-viet-gi.zod-dto'

@ApiTags('ChiTietKyNhanSuSachVietGi')
@ApiBearerAuth()
@Controller('chi-tiet-kynhan-su-sach-viet-gi')
export class ChiTietKyNhanSuSachVietGiController {
    constructor(private readonly chiTietKyNhanSuSachVietGiService: ChiTietKyNhanSuSachVietGiService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách sử sách viết gì của chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách thành công'
    })
    @ZodSerializerDto(MessageResDTO)
    list(@Query() query: PaginationQueryDTO) {
        return this.chiTietKyNhanSuSachVietGiService.list(query)
    }

    @Get(':suSachVietGiId')
    @ApiOperation({ summary: 'Lấy sử sách viết gì theo ID' })
    @ApiResponse({
        status: 200,
        description: 'Lấy sử sách viết gì thành công',
        type: GetChiTietKyNhanSuSachVietGiResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sử sách viết gì' })
    @ZodSerializerDto(GetChiTietKyNhanSuSachVietGiResDTO)
    findById(@Param() params: GetParamsChiTietKyNhanSuSachVietGiDTO) {
        return this.chiTietKyNhanSuSachVietGiService.findById(params.suSachVietGiId)
    }

    @Get('chi-tiet/:chiTietKyNhanId')
    @ApiOperation({ summary: 'Lấy danh sách sử sách viết gì theo ID chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách sử sách viết gì thành công',
        type: GetChiTietKyNhanSuSachVietGiListResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
    @ZodSerializerDto(GetChiTietKyNhanSuSachVietGiListResDTO)
    findByChiTietKyNhanId(@Param() params: GetParamsChiTietKyNhanSuSachVietGiByChiTietDTO) {
        return this.chiTietKyNhanSuSachVietGiService.findByChiTietKyNhanId(params.chiTietKyNhanId)
    }

    @Post()
    @ApiOperation({ summary: 'Tạo mới sử sách viết gì' })
    @ApiResponse({
        status: 201,
        description: 'Tạo mới sử sách viết gì thành công',
        type: CreateChiTietKyNhanSuSachVietGiResDTO
    })
    @ApiResponse({ status: 409, description: 'Sử sách viết gì đã tồn tại' })
    @ZodSerializerDto(CreateChiTietKyNhanSuSachVietGiResDTO)
    create(@Body() body: CreateChiTietKyNhanSuSachVietGiBodyDTO, @ActiveUser('userId') userId: number) {
        return this.chiTietKyNhanSuSachVietGiService.create({
            data: body,
            createdById: userId
        })
    }

    @Put(':suSachVietGiId')
    @ApiOperation({ summary: 'Cập nhật sử sách viết gì' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật sử sách viết gì thành công',
        type: UpdateChiTietKyNhanSuSachVietGiResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sử sách viết gì' })
    @ApiResponse({ status: 409, description: 'Sử sách viết gì đã tồn tại' })
    @ZodSerializerDto(UpdateChiTietKyNhanSuSachVietGiResDTO)
    update(
        @Body() body: UpdateChiTietKyNhanSuSachVietGiBodyDTO,
        @Param() params: GetParamsChiTietKyNhanSuSachVietGiDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.chiTietKyNhanSuSachVietGiService.update({
            data: body,
            id: params.suSachVietGiId,
            updatedById: userId
        })
    }

    @Delete(':suSachVietGiId')
    @ApiOperation({ summary: 'Xóa sử sách viết gì (soft delete)' })
    @ApiResponse({
        status: 200,
        description: 'Xóa sử sách viết gì thành công',
        type: MessageResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy sử sách viết gì' })
    @ZodSerializerDto(MessageResDTO)
    delete(@Param() params: GetParamsChiTietKyNhanSuSachVietGiDTO, @ActiveUser('userId') userId: number) {
        return this.chiTietKyNhanSuSachVietGiService.delete({
            id: params.suSachVietGiId,
            deletedById: userId
        })
    }
}
