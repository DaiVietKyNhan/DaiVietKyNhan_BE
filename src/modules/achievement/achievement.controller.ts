import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
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
    @ApiResponse({ status: 200, description: 'Get achievement list successfully' })
    async list(@Query() pagination: PaginationQueryType) {
        return this.achievementService.list(pagination)
    }

    @Get('active')
    @ApiOperation({ summary: 'Get active achievements' })
    @ApiResponse({ status: 200, description: 'Get active achievements successfully' })
    async getActiveAchievements() {
        return this.achievementService.getActiveAchievements()
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Get achievements by type' })
    @ApiResponse({ status: 200, description: 'Get achievements by type successfully' })
    async getAchievementsByType(@Param('type') type: 'KY_NHAN_SUMMARY_COUNT' | 'LAND_COLLECTION') {
        return this.achievementService.getAchievementsByType(type)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get achievement by id' })
    @ApiResponse({ status: 200, description: 'Get achievement successfully' })
    async findById(@Param('id') id: number) {
        return this.achievementService.findById(id)
    }

    @Post()
    @ApiOperation({ summary: 'Create achievement' })
    @ApiResponse({ status: 201, description: 'Create achievement successfully' })
    async create(@Body() data: CreateAchievementBodyDTO, @ActiveUser('userId') createdById: number) {
        return this.achievementService.create({ data, createdById })
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update achievement' })
    @ApiResponse({ status: 200, description: 'Update achievement successfully' })
    async update(
        @Param('id') id: number,
        @Body() data: UpdateAchievementBodyDTO,
        @ActiveUser('userId') updatedById: number
    ) {
        return this.achievementService.update({ id, data, updatedById })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete achievement' })
    @ApiResponse({ status: 200, description: 'Delete achievement successfully' })
    async delete(@Param('id') id: number, @ActiveUser('userId') deletedById: number) {
        return this.achievementService.delete({ id, deletedById })
    }
}