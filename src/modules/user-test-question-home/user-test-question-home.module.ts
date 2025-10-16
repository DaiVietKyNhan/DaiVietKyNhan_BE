import { Module } from '@nestjs/common'
import { TestQuestionHomeModule } from '../test-question-home/test-question-home.module'
import { UserTestQuestionHomeController } from './user-test-question-home.controller'
import { UserTestQuestionHomeRepo } from './user-test-question-home.repo'
import { UserTestQuestionHomeService } from './user-test-question-home.service'

@Module({
  imports: [TestQuestionHomeModule],
  controllers: [UserTestQuestionHomeController],
  providers: [UserTestQuestionHomeService, UserTestQuestionHomeRepo]
})
export class UserTestQuestionHomeModule {}
