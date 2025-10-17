import { Module } from '@nestjs/common'
import { KynhanSummaryModule } from '../kynhan-summary/kynhan-summary.module'
import { QuestionModule } from '../question/question.module'
import { UserAnswerLogController } from './user-answerlog.controller'
import { UserAnswerLogRepo } from './user-answerlog.repo'
import { UserAnswerLogService } from './user-answerlog.service'

@Module({
  imports: [QuestionModule, KynhanSummaryModule],
  controllers: [UserAnswerLogController],
  providers: [UserAnswerLogService, UserAnswerLogRepo]
})
export class UserAnswerlogModule {}
