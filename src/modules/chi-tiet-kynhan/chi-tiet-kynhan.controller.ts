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
    Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
    CreateChiTietKyNhanBodyDTO,
    CreateChiTietKyNhanResDTO,
    GetChiTietKyNhanByKyNhanParamsDTO,
    GetChiTietKyNhanListResDTO,
    GetChiTietKyNhanParamsDTO,
    GetChiTietKyNhanResDTO,
    UpdateChiTietKyNhanBodyDTO,
    UpdateChiTietKyNhanResDTO
} from './dto/chi-tiet-kynhan.zod-dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ChiTietKyNhanService } from './chi-tiet-kynhan.service'

@ApiTags('Chi Tiết Kỳ Nhân')
@Controller('chi-tiet-kynhan')
@ApiBearerAuth()
export class ChiTietKyNhanController {
    constructor(private readonly chiTietKyNhanService: ChiTietKyNhanService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách thành công'
    })
    @ZodSerializerDto(PaginationResponseSchema)
    list(@Query() query: PaginationQueryDTO) {
        return this.chiTietKyNhanService.list(query)
    }

    @Get(':chiTietKyNhanId')
    @ApiOperation({ summary: 'Lấy chi tiết kỳ nhân theo ID' })
    @ApiResponse({
        status: 200,
        description: 'Lấy chi tiết kỳ nhân thành công',
        type: GetChiTietKyNhanResDTO
    })
    @ZodSerializerDto(GetChiTietKyNhanResDTO)
    findById(@Param() params: GetChiTietKyNhanParamsDTO) {
        return this.chiTietKyNhanService.findById(params.chiTietKyNhanId)
    }

    @Get('ky-nhan/:kyNhanId')
    @ApiOperation({ summary: 'Lấy danh sách chi tiết theo kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách chi tiết theo kỳ nhân thành công',
        type: GetChiTietKyNhanListResDTO
    })
    @ZodSerializerDto(GetChiTietKyNhanListResDTO)
    findByKyNhanId(@Param() params: GetChiTietKyNhanByKyNhanParamsDTO) {
        return this.chiTietKyNhanService.findByKyNhanId(params.kyNhanId)
    }

    @Post()
    @ApiOperation({ summary: 'Tạo mới chi tiết kỳ nhân' })
    @ApiResponse({
        status: 201,
        description: 'Tạo chi tiết kỳ nhân thành công',
        type: CreateChiTietKyNhanResDTO
    })
    @ZodSerializerDto(CreateChiTietKyNhanResDTO)
    create(
        @Body() body: CreateChiTietKyNhanBodyDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.chiTietKyNhanService.create({
            data: body,
            createdById: userId
        })
    }

    @Put(':chiTietKyNhanId')
    @ApiOperation({ summary: 'Cập nhật chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật chi tiết kỳ nhân thành công',
        type: UpdateChiTietKyNhanResDTO
    })
    @ZodSerializerDto(UpdateChiTietKyNhanResDTO)
    update(
        @Body() body: UpdateChiTietKyNhanBodyDTO,
        @Param() params: GetChiTietKyNhanParamsDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.chiTietKyNhanService.update({
            data: body,
            id: params.chiTietKyNhanId,
            updatedById: userId
        })
    }

    @Delete(':chiTietKyNhanId')
    @ApiOperation({ summary: 'Xóa chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Xóa chi tiết kỳ nhân thành công',
        type: MessageResDTO
    })
    @ZodSerializerDto(MessageResDTO)
    delete(
        @Param() params: GetChiTietKyNhanParamsDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.chiTietKyNhanService.delete({
            id: params.chiTietKyNhanId,
            deletedById: userId
        })
    }
}
