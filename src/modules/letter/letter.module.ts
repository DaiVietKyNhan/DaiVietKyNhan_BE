import { Module } from '@nestjs/common'
import { LetterController } from './letter.controller'
import { LetterRepo } from './letter.repo'
import { LetterService } from './letter.service'

@Module({
    controllers: [LetterController],
    providers: [LetterService, LetterRepo],
    exports: [LetterService, LetterRepo]
})
export class LetterModule { }

