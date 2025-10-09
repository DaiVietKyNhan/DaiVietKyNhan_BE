import { Module } from '@nestjs/common'
import { SystemConfigController } from './system-config.controller'
import { SystemConfigRepo } from './system-config.repo'
import { SystemConfigService } from './system-config.service'

@Module({
  controllers: [SystemConfigController],
  providers: [SystemConfigService, SystemConfigRepo]
})
export class SystemConfigModule {}
