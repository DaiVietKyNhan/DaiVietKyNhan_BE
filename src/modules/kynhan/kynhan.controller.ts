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
import { KyNhanService } from './kynhan.service';

import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { CreateKyNhanBodyDTO, QueryKyNhanDTO, UpdateKyNhanBodyDTO } from './dto/kynhan.zod-dto';

@ApiTags('Kỳ Nhân')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@Controller('kynhan')
export class KyNhanController {
    constructor(private readonly kyNhanService: KyNhanService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo kỳ nhân mới' })
    @ApiResponse({ status: 201, description: 'Tạo kỳ nhân thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    create(@Body() createKyNhanDto: CreateKyNhanBodyDTO) {
        return this.kyNhanService.create(createKyNhanDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách kỳ nhân' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    findAll(@Query() query: QueryKyNhanDTO) {
        return this.kyNhanService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin kỳ nhân theo ID' })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kỳ nhân' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.kyNhanService.findOneWithResponse(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin kỳ nhân' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kỳ nhân' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateKyNhanDto: UpdateKyNhanBodyDTO,
    ) {
        return this.kyNhanService.update(id, updateKyNhanDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa kỳ nhân (soft delete)' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kỳ nhân' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.kyNhanService.remove(id);
    }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Khôi phục kỳ nhân đã xóa' })
    @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy kỳ nhân đã xóa' })
    restore(@Param('id', ParseIntPipe) id: number) {
        return this.kyNhanService.restore(id);
    }
}
