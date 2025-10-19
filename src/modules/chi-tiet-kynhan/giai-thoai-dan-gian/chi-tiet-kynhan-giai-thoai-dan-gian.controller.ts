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
import { ChiTietKyNhanGiaiThoaiDanGianService } from './chi-tiet-kynhan-giai-thoai-dan-gian.service'
import {
    CreateChiTietKyNhanGiaiThoaiDanGianBodyDTO,
    CreateChiTietKyNhanGiaiThoaiDanGianResDTO,
    GetChiTietKyNhanGiaiThoaiDanGianListResDTO,
    GetChiTietKyNhanGiaiThoaiDanGianResDTO,
    GetParamsChiTietKyNhanGiaiThoaiDanGianByChiTietDTO,
    GetParamsChiTietKyNhanGiaiThoaiDanGianDTO,
    UpdateChiTietKyNhanGiaiThoaiDanGianBodyDTO,
    UpdateChiTietKyNhanGiaiThoaiDanGianResDTO
} from './dto/chi-tiet-kynhan-giai-thoai-dan-gian.zod-dto'

@ApiTags('ChiTietKyNhanGiaiThoaiDanGian')
@ApiBearerAuth()
@Controller('chi-tiet-kynhan-giai-thoai-dan-gian')
export class ChiTietKyNhanGiaiThoaiDanGianController {
    constructor(private readonly chiTietKyNhanGiaiThoaiDanGianService: ChiTietKyNhanGiaiThoaiDanGianService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách giai thoại dân gian của chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách thành công'
    })
    @ZodSerializerDto(MessageResDTO)
    list(@Query() query: PaginationQueryDTO) {
        return this.chiTietKyNhanGiaiThoaiDanGianService.list(query)
    }

    @Get(':giaiThoaiDanGianId')
    @ApiOperation({ summary: 'Lấy giai thoại dân gian theo ID' })
    @ApiResponse({
        status: 200,
        description: 'Lấy giai thoại dân gian thành công',
        type: GetChiTietKyNhanGiaiThoaiDanGianResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy giai thoại dân gian' })
    @ZodSerializerDto(GetChiTietKyNhanGiaiThoaiDanGianResDTO)
    findById(@Param() params: GetParamsChiTietKyNhanGiaiThoaiDanGianDTO) {
        return this.chiTietKyNhanGiaiThoaiDanGianService.findById(params.giaiThoaiDanGianId)
    }

    @Get('chi-tiet/:chiTietKyNhanId')
    @ApiOperation({ summary: 'Lấy danh sách giai thoại dân gian theo ID chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách giai thoại dân gian thành công',
        type: GetChiTietKyNhanGiaiThoaiDanGianListResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
    @ZodSerializerDto(GetChiTietKyNhanGiaiThoaiDanGianListResDTO)
    findByChiTietKyNhanId(@Param() params: GetParamsChiTietKyNhanGiaiThoaiDanGianByChiTietDTO) {
        return this.chiTietKyNhanGiaiThoaiDanGianService.findByChiTietKyNhanId(params.chiTietKyNhanId)
    }

    @Post()
    @ApiOperation({ summary: 'Tạo mới giai thoại dân gian' })
    @ApiResponse({
        status: 201,
        description: 'Tạo mới giai thoại dân gian thành công',
        type: CreateChiTietKyNhanGiaiThoaiDanGianResDTO
    })
    @ApiResponse({ status: 409, description: 'Giai thoại dân gian đã tồn tại' })
    @ZodSerializerDto(CreateChiTietKyNhanGiaiThoaiDanGianResDTO)
    create(@Body() body: CreateChiTietKyNhanGiaiThoaiDanGianBodyDTO, @ActiveUser('userId') userId: number) {
        return this.chiTietKyNhanGiaiThoaiDanGianService.create({
            data: body,
            createdById: userId
        })
    }

    @Put(':giaiThoaiDanGianId')
    @ApiOperation({ summary: 'Cập nhật giai thoại dân gian' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật giai thoại dân gian thành công',
        type: UpdateChiTietKyNhanGiaiThoaiDanGianResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy giai thoại dân gian' })
    @ApiResponse({ status: 409, description: 'Giai thoại dân gian đã tồn tại' })
    @ZodSerializerDto(UpdateChiTietKyNhanGiaiThoaiDanGianResDTO)
    update(
        @Body() body: UpdateChiTietKyNhanGiaiThoaiDanGianBodyDTO,
        @Param() params: GetParamsChiTietKyNhanGiaiThoaiDanGianDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.chiTietKyNhanGiaiThoaiDanGianService.update({
            data: body,
            id: params.giaiThoaiDanGianId,
            updatedById: userId
        })
    }

    @Delete(':giaiThoaiDanGianId')
    @ApiOperation({ summary: 'Xóa giai thoại dân gian (soft delete)' })
    @ApiResponse({
        status: 200,
        description: 'Xóa giai thoại dân gian thành công',
        type: MessageResDTO
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy giai thoại dân gian' })
    @ZodSerializerDto(MessageResDTO)
    delete(@Param() params: GetParamsChiTietKyNhanGiaiThoaiDanGianDTO, @ActiveUser('userId') userId: number) {
        return this.chiTietKyNhanGiaiThoaiDanGianService.delete({
            id: params.giaiThoaiDanGianId,
            deletedById: userId
        })
    }
}
