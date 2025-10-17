import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthenticationGuard } from '@/common/guards/authentication.guard'
import { User } from '@/common/decorators/user.decorator'
import { CreateUserRewardBodyDTO, UpdateUserRewardBodyDTO, ExchangeRewardBodyDTO } from './dto/user-reward.zod-dto'
import { UserRewardService } from './user-reward.service'

@ApiTags('User Reward')
@Controller('user-reward')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
export class UserRewardController {
    constructor(private userRewardService: UserRewardService) { }

    @Get()
    @ApiOperation({ summary: 'Get user reward list' })
    @ApiResponse({ status: 200, description: 'Get user reward list successfully' })
    async findMany(@Query() pagination: PaginationQueryType, @Query() where: any, @Query() orderBy: any) {
        return this.userRewardService.findMany({ pagination, where, orderBy })
    }

    @Get('my-rewards')
    @ApiOperation({ summary: 'Get my rewards' })
    @ApiResponse({ status: 200, description: 'Get my rewards successfully' })
    async getMyRewards(@User('id') userId: number) {
        return this.userRewardService.findByUserId(userId)
    }

    @Get('my-rewards/:status')
    @ApiOperation({ summary: 'Get my rewards by status' })
    @ApiResponse({ status: 200, description: 'Get my rewards by status successfully' })
    async getMyRewardsByStatus(
        @User('id') userId: number,
        @Param('status') status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
    ) {
        return this.userRewardService.findByUserIdAndStatus(userId, status)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user reward by id' })
    @ApiResponse({ status: 200, description: 'Get user reward successfully' })
    async findById(@Param('id') id: number) {
        return this.userRewardService.findById(id)
    }

    @Post()
    @ApiOperation({ summary: 'Create user reward' })
    @ApiResponse({ status: 201, description: 'Create user reward successfully' })
    async create(@Body() data: CreateUserRewardBodyDTO, @User('id') createdById: number) {
        return this.userRewardService.create({ data, createdById })
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user reward' })
    @ApiResponse({ status: 200, description: 'Update user reward successfully' })
    async update(
        @Param('id') id: number,
        @Body() data: UpdateUserRewardBodyDTO,
        @User('id') updatedById: number
    ) {
        return this.userRewardService.update({ id, data, updatedById })
    }

    @Post('exchange')
    @ApiOperation({ summary: 'Exchange reward' })
    @ApiResponse({ status: 200, description: 'Exchange reward successfully' })
    async exchangeReward(@Body() data: ExchangeRewardBodyDTO, @User('id') userId: number) {
        return this.userRewardService.exchangeReward({
            userId,
            rewardId: data.rewardId,
            code: data.code,
            createdById: userId
        })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user reward' })
    @ApiResponse({ status: 200, description: 'Delete user reward successfully' })
    async delete(@Param('id') id: number, @User('id') deletedById: number) {
        return this.userRewardService.delete({ id, deletedById })
    }
}
