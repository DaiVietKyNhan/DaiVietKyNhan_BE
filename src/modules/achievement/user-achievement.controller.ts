import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateUserAchievementBodyDTO, UpdateUserAchievementBodyDTO } from './dto/user-achievement.zod-dto'
import { UserAchievementService } from './user-achievement.service'

@ApiTags('User Achievement')
@Controller('user-achievement')
@ApiBearerAuth()
export class UserAchievementController {
    constructor(private userAchievementService: UserAchievementService) { }

    @Get()
    @ApiOperation({ summary: 'Get user achievement list' })
    @ApiResponse({ status: 200, description: 'Get user achievement list successfully' })
    async list(@Query() pagination: PaginationQueryType) {
        return this.userAchievementService.list(pagination)
    }

    @Get('my-achievements')
    @ApiOperation({ summary: 'Get my achievements' })
    @ApiResponse({ status: 200, description: 'Get my achievements successfully' })
    async getMyAchievements(@ActiveUser('userId') userId: number) {
        return this.userAchievementService.findByUserId(userId)
    }

    @Get('my-achievements/:status')
    @ApiOperation({ summary: 'Get my achievements by status' })
    @ApiResponse({ status: 200, description: 'Get my achievements by status successfully' })
    async getMyAchievementsByStatus(
        @ActiveUser('userId') userId: number,
        @Param('status') status: 'PENDING' | 'COMPLETED' | 'CLAIMED'
    ) {
        return this.userAchievementService.findByUserIdAndStatus(userId, status)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user achievement by id' })
    @ApiResponse({ status: 200, description: 'Get user achievement successfully' })
    async findById(@Param('id') id: number) {
        return this.userAchievementService.findById(id)
    }

    @Post()
    @ApiOperation({ summary: 'Create user achievement' })
    @ApiResponse({ status: 201, description: 'Create user achievement successfully' })
    async create(@Body() data: CreateUserAchievementBodyDTO, @ActiveUser('userId') createdById: number) {
        return this.userAchievementService.create({ data, createdById })
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user achievement' })
    @ApiResponse({ status: 200, description: 'Update user achievement successfully' })
    async update(
        @Param('id') id: number,
        @Body() data: UpdateUserAchievementBodyDTO,
        @ActiveUser('userId') updatedById: number
    ) {
        return this.userAchievementService.update({ id, data, updatedById })
    }

    @Post('claim-reward/:achievementId')
    @ApiOperation({ summary: 'Claim achievement reward' })
    @ApiResponse({ status: 200, description: 'Claim reward successfully' })
    async claimReward(@ActiveUser('userId') userId: number, @Param('achievementId') achievementId: number) {
        return this.userAchievementService.claimReward({ userId, achievementId, updatedById: userId })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user achievement' })
    @ApiResponse({ status: 200, description: 'Delete user achievement successfully' })
    async delete(@Param('id') id: number, @ActiveUser('userId') deletedById: number) {
        return this.userAchievementService.delete({ id, deletedById })
    }
}