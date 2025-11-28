import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
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
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành tựu của user thành công' })
    async list(@Query() pagination: PaginationQueryType) {
        return this.userAchievementService.list(pagination)
    }

    @Get('my-achievements')
    @ApiOperation({ summary: 'Get my achievements' })
    @ApiResponse({ status: 200, description: 'Lấy thành tựu của user thành công' })
    async getMyAchievements(@ActiveUser('userId') userId: number) {
        return this.userAchievementService.findByUserId(userId)
    }

    @Get('my-achievements/:status')
    @ApiOperation({ summary: 'Get my achievements by status' })
    @ApiResponse({ status: 200, description: 'Lấy thành tựu của user theo trạng thái thành công' })
    async getMyAchievementsByStatus(
        @ActiveUser('userId') userId: number,
        @Param('status') status: 'PENDING' | 'COMPLETED' | 'CLAIMED'
    ) {
        return this.userAchievementService.findByUserIdAndStatus(userId, status)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user achievement by id' })
    @ApiResponse({ status: 200, description: 'Lấy thành tựu của user thành công' })
    async findById(@Param('id') id: string) {
        return this.userAchievementService.findById(Number(id))
    }

    @Post()
    @ApiOperation({ summary: 'Create user achievement' })
    @ApiResponse({ status: 201, description: 'Tạo thành tựu của user thành công' })
    async create(@Body() data: CreateUserAchievementBodyDTO, @ActiveUser('userId') createdById: number) {
        return this.userAchievementService.create({ data, createdById })
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user achievement' })
    @ApiResponse({ status: 200, description: 'Cập nhập thành tựu của user thành công' })
    async update(
        @Param('id') id: string,
        @Body() data: UpdateUserAchievementBodyDTO,
        @ActiveUser('userId') updatedById: number
    ) {
        return this.userAchievementService.update({ id: Number(id), data, updatedById })
    }

    @Post('claim-reward/:achievementId')
    @ApiOperation({ summary: 'Claim achievement reward' })
    @ApiResponse({ status: 200, description: 'Nhận thưởng thành tựu thành công' })
    async claimReward(@ActiveUser('userId') userId: number, @Param('achievementId') achievementId: string) {
        return this.userAchievementService.claimReward({
            userId,
            achievementId: Number(achievementId),
            updatedById: userId
        })
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user achievement' })
    @ApiResponse({ status: 200, description: 'Xóa thành tựu của user thành công' })
    async delete(@Param('id') id: string, @ActiveUser('userId') deletedById: number) {
        return this.userAchievementService.delete({ id: Number(id), deletedById })
    }
}