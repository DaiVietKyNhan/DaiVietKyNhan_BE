import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { UserRewardHistoryRepo } from './user-reward-history.repo'
import { UserRewardService } from './user-reward.service'

@ApiTags('User Reward History')
@Controller('user-reward-history')
@ApiBearerAuth()
export class UserRewardHistoryController {
  constructor(
    private userRewardHistoryRepo: UserRewardHistoryRepo,
    private userRewardService: UserRewardService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đổi quà với phân trang' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  list(@Query() query: PaginationQueryDTO) {
    return this.userRewardService.listHistory(query)
  }

  @Get('my-history')
  getMyHistory(@ActiveUser('userId') userId: number) {
    return this.userRewardHistoryRepo.findByUserId(userId)
  }

  @Get('special')
  getSpecialUserRewards(@Query() query: PaginationQueryDTO) {
    return this.userRewardService.getSpecialUserRewards(query)
  }

  @Post('init-migrate-code-rewards')
  @ApiOperation({
    summary:
      'Migrate UserReward type CODE với status COMPLETED sang UserRewardHistory (Admin only)',
    description:
      'Di chuyển tất cả UserReward có type CODE và status COMPLETED sang UserRewardHistory với status CLAIMED'
  })
  @ApiResponse({
    status: 200,
    description: 'Migration thành công'
  })
  initMigrateCodeRewards(@ActiveUser('userId') userId: number) {
    return this.userRewardService.initMigrateCodeRewardsToHistory(userId)
  }
}
