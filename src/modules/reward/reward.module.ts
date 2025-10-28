import { Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { SharedModule } from '@/shared/shared.module'

import { RewardController } from './reward.controller'
import { RewardRepo } from './reward.repo'
import { RewardService } from './reward.service'
import { UserRewardController } from './user-reward.controller'
import { UserRewardRepo } from './user-reward.repo'
import { UserRewardService } from './user-reward.service'
import { UserRewardHistoryRepo } from './user-reward-history.repo'
import { UserRewardHistoryController } from './user-reward-history.controller'

@Module({
    imports: [SharedModule],
    controllers: [RewardController, UserRewardController, UserRewardHistoryController],
    providers: [
        RewardService,
        RewardRepo,
        UserRewardService,
        UserRewardRepo,
        PrismaService,
        UserRewardHistoryRepo
    ],
    exports: [RewardService, UserRewardService]
})
export class RewardModule { }
