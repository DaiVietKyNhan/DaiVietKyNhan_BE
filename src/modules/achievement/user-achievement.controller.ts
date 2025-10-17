import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthenticationGuard } from '@/common/guards/authentication.guard'
import { User } from '@/common/decorators/user.decorator'
import { CreateUserAchievementBodyDTO, UpdateUserAchievementBodyDTO } from './dto/user-achievement.zod-dto'
import { UserAchievementService } from './user-achievement.service'

@ApiTags('User Achievement')
@Controller('user-achievement')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
export class UserAchievementController {
    constructor(private userAchievementService: UserAchievementService) { }

    @Get()
    @ApiOperation({ summary: 'Get user achievement list' })
    @ApiResponse({ status: 200, description: 'Get user achievement list successfully' })
    async findMany(@Query() pagination: PaginationQueryType, @Query() where: any, @Query() orderBy: any) {
        return this.userAchievementService.findMany({ pagination, where, orderBy })
    }

    @Get('my-achievements')
    @ApiOperation({ summary: 'Get my achievements' })
    @ApiResponse({ status: 200, description: 'Get my achievements successfully' })
    async getMyAchievements(@User('id') userId: number) {
        return this.userAchievementService.findByUserId(userId)
    }

    @Get('my-achievements/:status')
    @ApiOperation({ summary: 'Get my achievements by status' })
    @ApiResponse({ status: 200, description: 'Get my achievements by status successfully' })
    async getMyAchievementsByStatus(
        @User('id') userId: number,
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
    async create(@Body() data: CreateUserAchievementBodyDTO, @User('id') createdById: number) {
        return this.userAchievementService.create({ data, createdById })
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user achievement' })
    @ApiResponse({ status: 200, description: 'Update user achievement successfully' })
    async update(
        @Param('id') id: number,
        @Body() data: UpdateUserAchievementBodyDTO,
        @User('id') updatedById: number
    ) {
        return this.userAchievementService.update({ id, data, updatedById })
    }

    @Post('claim-reward/:achievementId')
    @ApiOperation({ summary: 'Claim achievement reward' })
    @ApiResponse({ status: 200, description: 'Claim reward successfully' })
    async claimReward(@User('id') userId: number, @Param('achievementId') achievementId: number) {
        return this.userAchievementService.claimReward({ userId, achievementId, updatedById: userId })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user achievement' })
    @ApiResponse({ status: 200, description: 'Delete user achievement successfully' })
    async delete(@Param('id') id: number, @User('id') deletedById: number) {
        return this.userAchievementService.delete({ id, deletedById })
    }
}
