import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateAchievementBodyDTO, UpdateAchievementBodyDTO } from './dto/achievement.zod-dto'
import { AchievementService } from './achievement.service'

@ApiTags('Achievement')
@Controller('achievement')
@ApiBearerAuth()
export class AchievementController {
    constructor(private achievementService: AchievementService) { }

    @Get()
    @ApiOperation({ summary: 'Get achievement list' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành tựu thành công' })
    async list(@Query() pagination: PaginationQueryType) {
        return this.achievementService.list(pagination)
    }

    @Get('active')
    @ApiOperation({ summary: 'Get active achievements' })
    @ApiResponse({ status: 200, description: 'Lấy thành tựu active thành công' })
    async getActiveAchievements() {
        return this.achievementService.getActiveAchievements()
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Get achievements by type' })
    @ApiResponse({ status: 200, description: 'Lấy thành tựu theo loại thành công' })
    async getAchievementsByType(@Param('type') type: 'KY_NHAN_SUMMARY_COUNT' | 'LAND_COLLECTION') {
        return this.achievementService.getAchievementsByType(type)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get achievement by id' })
    @ApiResponse({ status: 200, description: 'Lấy thành tựu thành công' })
    async findById(@Param('id') id: number) {
        return this.achievementService.findById(id)
    }

    @Post()
    @ApiOperation({ summary: 'Create achievement' })
    @ApiResponse({ status: 201, description: 'Tạo thành tựu thành công' })
    async create(@Body() data: CreateAchievementBodyDTO, @ActiveUser('userId') createdById: number) {
        return this.achievementService.create({ data, createdById })
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update achievement' })
    @ApiResponse({ status: 200, description: 'Cập nhập thành tựu thành công' })
    async update(
        @Param('id') id: number,
        @Body() data: UpdateAchievementBodyDTO,
        @ActiveUser('userId') updatedById: number
    ) {
        return this.achievementService.update({ id, data, updatedById })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete achievement' })
    @ApiResponse({ status: 200, description: 'Xóa thành tựu thành công' })
    async delete(@Param('id') id: number, @ActiveUser('userId') deletedById: number) {
        return this.achievementService.delete({ id, deletedById })
    }

    @Post('initialize-for-all-users')
    @ApiOperation({ summary: 'Initialize all achievements for all users' })
    @ApiResponse({ status: 200, description: 'cập nhập thành tựu cho tất cả user thành công' })
    async initializeForAllUsers(@ActiveUser('userId') createdById: number) {
        return this.achievementService.initializeForAllUsers(createdById)
    }
}