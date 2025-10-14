import { SOCKET_EVENT } from '@/common/constants/socket.constant'
import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { SystemConfigService } from '../modules/system-config/system-config.service'

@WebSocketGateway({ namespace: 'home-page' })
@Injectable()
export class HomePageGateway {
  @WebSocketServer()
  server: Server

  constructor(private readonly systemConfigService: SystemConfigService) {}

  // Register to up system-config
  async handleIncreaseAmountSystemConfig() {
    try {
      // Lấy SystemConfig đang active
      const activeSystemConfig =
        await this.systemConfigService.findByActiveWithAmountUser(true)
      if (activeSystemConfig.data.systemConfig) {
        // Emit event tới tất cả client trong room home-page
        this.server.emit(SOCKET_EVENT.USER_COUNT_UPDATED, {
          systemConfig: activeSystemConfig.data.systemConfig,
          amountUser: activeSystemConfig.data.amountUser,
          message: 'Có thành viên mới tham gia!'
        })
      }
    } catch (error) {
      console.error('❌ Error in handleIncreaseAmountSystemConfig:', error)
    }
  }
}
