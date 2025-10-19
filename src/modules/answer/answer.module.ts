import { Module } from '@nestjs/common'
import { AnswerController } from './answer.controller'
import { AnswerRepo } from './answer.repo'
import { AnswerService } from './answer.service'

@Module({
  controllers: [AnswerController],
  providers: [AnswerService, AnswerRepo],
  exports: [AnswerService, AnswerRepo]
})
export class AnswerModule {}
