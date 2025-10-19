import { Module } from '@nestjs/common'
import { AchievementModule } from '../achievement/achievement.module'
import { KynhanSummaryModule } from '../kynhan-summary/kynhan-summary.module'
import { QuestionModule } from '../question/question.module'
import { UserLandBargeModule } from '../user-land-barge/user-land-barge.module'
import { UserLandModule } from '../user-land/user-land.module'
import { UserAnswerLogController } from './user-answerlog.controller'
import { UserAnswerLogRepo } from './user-answerlog.repo'
import { UserAnswerLogService } from './user-answerlog.service'

@Module({
  imports: [
    QuestionModule,
    KynhanSummaryModule,
    AchievementModule,
    UserLandModule,
    UserLandBargeModule
  ],
  controllers: [UserAnswerLogController],
  providers: [UserAnswerLogService, UserAnswerLogRepo]
})
export class UserAnswerlogModule {}
