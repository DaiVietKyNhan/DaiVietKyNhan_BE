import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateRewardBodyDTO, UpdateRewardBodyDTO } from './dto/reward.zod-dto'
import { RewardService } from './reward.service'

@ApiTags('Reward')
@Controller('reward')
@ApiBearerAuth()
export class RewardController {
    constructor(private rewardService: RewardService) { }

    @Get()
    @ApiOperation({ summary: 'Get reward list' })
    @ApiResponse({ status: 200, description: 'Get reward list successfully' })
    async list(@Query() pagination: PaginationQueryType) {
        return this.rewardService.list(pagination)
    }

    @Get('active')
    @ApiOperation({ summary: 'Get active rewards' })
    @ApiResponse({ status: 200, description: 'Get active rewards successfully' })
    async getActiveRewards() {
        return this.rewardService.getActiveRewards()
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Get rewards by type' })
    @ApiResponse({ status: 200, description: 'Get rewards by type successfully' })
    async getRewardsByType(@Param('type') type: 'POINT' | 'COIN' | 'CODE') {
        return this.rewardService.getRewardsByType(type)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get reward by id' })
    @ApiResponse({ status: 200, description: 'Get reward successfully' })
    async findById(@Param('id') id: number) {
        return this.rewardService.findById(id)
    }

    @Post()
    @ApiOperation({ summary: 'Create reward' })
    @ApiResponse({ status: 201, description: 'Create reward successfully' })
    async create(@Body() data: CreateRewardBodyDTO, @ActiveUser('userId') createdById: number) {
        return this.rewardService.create({ data, createdById })
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update reward' })
    @ApiResponse({ status: 200, description: 'Update reward successfully' })
    async update(
        @Param('id') id: number,
        @Body() data: UpdateRewardBodyDTO,
        @ActiveUser('userId') updatedById: number
    ) {
        return this.rewardService.update({ id, data, updatedById })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete reward' })
    @ApiResponse({ status: 200, description: 'Delete reward successfully' })
    async delete(@Param('id') id: number, @ActiveUser('userId') deletedById: number) {
        return this.rewardService.delete({ id, deletedById })
    }
}