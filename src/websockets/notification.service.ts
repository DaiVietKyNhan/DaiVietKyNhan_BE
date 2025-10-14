import { Injectable } from '@nestjs/common'
import { HomePageGateway } from './home-page.gateway'

@Injectable()
export class NotificationService {
  constructor(private readonly homePageGateway: HomePageGateway) {}

  async notifyNewUserRegistered() {
    try {
      await this.homePageGateway.handleIncreaseAmountSystemConfig()
    } catch (error) {
      console.error('❌ Error notifying new user registration:', error)
    }
  }
}
