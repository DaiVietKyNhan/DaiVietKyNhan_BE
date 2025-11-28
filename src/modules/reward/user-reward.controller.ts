import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { PaginationResponseSchema } from '@/shared/models/response.model'
import { ZodSerializerDto } from 'nestjs-zod'
import {
    CreateUserRewardBodyDTO,
    ExchangeRewardBodyDTO,
    GetListUserRewardQueryDTO,
    RedeemCodeBodyDTO,
    UpdateUserRewardBodyDTO
} from './dto/user-reward.zod-dto'
import { UserRewardService } from './user-reward.service'

@ApiTags('User Reward')
@Controller('user-reward')
@ApiBearerAuth()
export class UserRewardController {
    constructor(private userRewardService: UserRewardService) { }

    @Get()
    @ApiOperation({ summary: 'Get user reward list' })
    @ApiResponse({ status: 200, description: 'Get user reward list successfully' })
    async list(@Query() pagination: PaginationQueryType) {
        return this.userRewardService.list(pagination)
    }

    @Get('reward')
    @ApiOperation({ summary: 'Get user reward list with filters' })
    @ApiResponse({ status: 200, description: 'Get user reward list successfully' })
    @ZodSerializerDto(PaginationResponseSchema)
    getListUserREward(@Query() query: GetListUserRewardQueryDTO) {
        return this.userRewardService.getListUserReward(query)
    }

    @Get('my-rewards')
    @ApiOperation({ summary: 'Get my rewards' })
    @ApiResponse({ status: 200, description: 'Get my rewards successfully' })
    async getMyRewards(@ActiveUser('userId') userId: number) {
        return this.userRewardService.findByUserId(userId)
    }

    @Get('my-rewards/:status')
    @ApiOperation({ summary: 'Get my rewards by status' })
    @ApiResponse({ status: 200, description: 'Get my rewards by status successfully' })
    async getMyRewardsByStatus(
        @ActiveUser('userId') userId: number,
        @Param('status') status: 'PENDING' | 'COMPLETED' | 'CLAIMED' | 'CANCELLED'
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
    async create(
        @Body() data: CreateUserRewardBodyDTO,
        @ActiveUser('userId') createdById: number
    ) {
        return this.userRewardService.create({ data, createdById })
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user reward' })
    @ApiResponse({ status: 200, description: 'Update user reward successfully' })
    async update(
        @Param('id') id: number,
        @Body() data: UpdateUserRewardBodyDTO,
        @ActiveUser('userId') updatedById: number
    ) {
        return this.userRewardService.update({ id, data, updatedById })
    }

    @Post('exchange')
    @ApiOperation({ summary: 'Exchange reward' })
    @ApiResponse({ status: 200, description: 'đổi quà thành công' })
    async exchangeReward(
        @Body() data: ExchangeRewardBodyDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.userRewardService.exchangeReward({
            userId,
            rewardId: data.rewardId
        })
    }

    @Post('redeem-code')
    @ApiOperation({ summary: 'Đổi quà bằng code' })
    @ApiResponse({ status: 200, description: 'Đổi quà bằng code thành công' })
    async redeemCode(
        @Body() data: RedeemCodeBodyDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.userRewardService.redeemCode({
            userId,
            code: data.code
        })
    }

    @Post('initialize-all-users-rewards')
    @ApiOperation({ summary: 'Initialize all system rewards for all users' })
    @ApiResponse({
        status: 200,
        description: 'Khởi tạo tất cả reward cho tất cả users thành công'
    })
    async initializeAllUsersRewards(@ActiveUser('userId') createdById: number) {
        return this.userRewardService.addAllSystemRewardsToAllUsers({ createdById })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user reward' })
    @ApiResponse({ status: 200, description: 'Delete user reward successfully' })
    async delete(@Param('id') id: number, @ActiveUser('userId') deletedById: number) {
        return this.userRewardService.delete({ id, deletedById })
    }
}
