import { Module } from '@nestjs/common'
import { TestQuestionHomeController } from './test-question-home.controller'
import { TestQuestionHomeRepo } from './test-question-home.repo'
import { TestQuestionHomeService } from './test-question-home.service'

@Module({
  controllers: [TestQuestionHomeController],
  providers: [TestQuestionHomeService, TestQuestionHomeRepo],
  exports: [TestQuestionHomeService, TestQuestionHomeRepo]
})
export class TestQuestionHomeModule {}
