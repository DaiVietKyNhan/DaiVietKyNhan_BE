import { Module } from '@nestjs/common'
import { ChiTietKyNhanModule } from '../chitietkynhan/chitietkynhan.module'
import { KyNhanController } from './kynhan.controller'
import { KyNhanRepository } from './kynhan.repo'
import { KyNhanService } from './kynhan.service'

@Module({
  imports: [ChiTietKyNhanModule],
  controllers: [KyNhanController],
  providers: [KyNhanService, KyNhanRepository],
  exports: [KyNhanService, KyNhanRepository]
})
export class KyNhanModule {}
