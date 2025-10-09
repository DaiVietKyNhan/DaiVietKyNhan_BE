import { Module } from '@nestjs/common'
import { ChiTietKyNhanController } from './chitietkynhan.controller'
import { ChiTietKyNhanRepository } from './chitietkynhan.repo'
import { ChiTietKyNhanService } from './chitietkynhan.service'

@Module({
  imports: [],
  controllers: [ChiTietKyNhanController],
  providers: [ChiTietKyNhanService, ChiTietKyNhanRepository],
  exports: [ChiTietKyNhanService, ChiTietKyNhanRepository]
})
export class ChiTietKyNhanModule {}
