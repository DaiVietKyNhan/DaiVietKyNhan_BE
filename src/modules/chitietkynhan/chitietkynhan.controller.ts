import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChiTietKyNhanService } from './chitietkynhan.service';
import { CreateChiTietKyNhanBodyDTO, UpdateChiTietKyNhanBodyDTO, QueryChiTietKyNhanDTO, ChiTietKyNhanResDTO } from './dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from '@/shared/dtos/response.dto';
import { PaginationResponseSchema } from '@/shared/models/response.model';

@ApiTags('Chi Tiết Kỳ Nhân')
@ApiBearerAuth()
@Controller('chitietkynhan')
export class ChiTietKyNhanController {
    constructor(private readonly chiTietKyNhanService: ChiTietKyNhanService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo chi tiết kỳ nhân mới' })
    @ApiResponse({ status: 201, description: 'Tạo chi tiết kỳ nhân thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ZodSerializerDto(CreateChiTietKyNhanBodyDTO)
    create(@Body() createChiTietKyNhanDto: CreateChiTietKyNhanBodyDTO) {
        return this.chiTietKyNhanService.create(createChiTietKyNhanDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin chi tiết kỳ nhân' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
    @ZodSerializerDto(UpdateChiTietKyNhanBodyDTO)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateChiTietKyNhanDto: UpdateChiTietKyNhanBodyDTO,
    ) {
        return this.chiTietKyNhanService.update(id, updateChiTietKyNhanDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa chi tiết kỳ nhân (soft delete)' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
    @ZodSerializerDto(MessageResDTO)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.chiTietKyNhanService.remove(id);
    }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Khôi phục chi tiết kỳ nhân đã xóa' })
    @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân đã xóa' })
    @ZodSerializerDto(MessageResDTO)
    restore(@Param('id', ParseIntPipe) id: number) {
        return this.chiTietKyNhanService.restore(id);
    }


    @Get()
    @ApiOperation({ summary: 'Lấy danh sách chi tiết kỳ nhân' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    @ZodSerializerDto(PaginationResponseSchema)
    findAll(@Query() query: QueryChiTietKyNhanDTO) {
        return this.chiTietKyNhanService.findAll(query);
    }

    @Get('kynhan/:kyNhanId')
    @ApiOperation({ summary: 'Lấy chi tiết kỳ nhân theo ID kỳ nhân' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kỳ nhân' })
    @ZodSerializerDto(PaginationResponseSchema)
    findByKyNhanId(@Param('kyNhanId', ParseIntPipe) kyNhanId: number) {
        return this.chiTietKyNhanService.findByKyNhanId(kyNhanId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin chi tiết kỳ nhân theo ID' })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết kỳ nhân' })
    @ZodSerializerDto(ChiTietKyNhanResDTO)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.chiTietKyNhanService.findOneWithResponse(id);
    }
}
