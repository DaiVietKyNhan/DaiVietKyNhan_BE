import { Module } from '@nestjs/common'
import { SystemConfigModule } from '../modules/system-config/system-config.module'

import { InitializerGateway } from './initializer.gateway'
import { SocketServerService } from './socket-server.service'

import { HomePageGateway } from './home-page.gateway'
import { NotificationService } from './notification.service'
import { WebsocketsService } from './websockets.service'

@Module({
  imports: [SystemConfigModule],
  providers: [
    WebsocketsService,
    SocketServerService,
    InitializerGateway,
    HomePageGateway,
    NotificationService
  ],
  exports: [WebsocketsService, SocketServerService, HomePageGateway, NotificationService]
})
export class WebsocketsModule {}
