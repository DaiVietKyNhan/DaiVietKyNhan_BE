import { Module } from '@nestjs/common'
import { AnswerModule } from '../answer/answer.module'
import { LandModule } from '../land/land.module'
import { QuestionController } from './question.controller'
import { QuestionRepo } from './question.repo'
import { QuestionService } from './question.service'

@Module({
  imports: [AnswerModule, LandModule],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRepo],
  exports: [QuestionService, QuestionRepo]
})
export class QuestionModule {}
