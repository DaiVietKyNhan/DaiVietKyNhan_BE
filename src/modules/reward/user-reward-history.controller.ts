import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { UserRewardHistoryRepo } from './user-reward-history.repo'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { ActiveUser } from '@/common/decorators/active-user.decorator'

@ApiTags('User Reward History')
@Controller('user-reward-history')
@ApiBearerAuth()
export class UserRewardHistoryController {
    constructor(private userRewardHistoryRepo: UserRewardHistoryRepo) { }

    @Get()
    list(@Query() query: PaginationQueryDTO) {
        return this.userRewardHistoryRepo.list(query)
    }

    @Get('my-history')
    getMyHistory(@ActiveUser('userId') userId: number) {
        return this.userRewardHistoryRepo.findByUserId(userId)
    }
}
