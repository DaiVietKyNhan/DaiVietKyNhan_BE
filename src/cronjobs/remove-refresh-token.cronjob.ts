import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class ResetHeartAllUserCronjob {
  private readonly logger = new Logger(ResetHeartAllUserCronjob.name)
  constructor(private prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  async handleCron() {
    this.logger.debug(`Reset heart for users!.`)
    const addHeartUser = await this.prismaService.user.updateMany({
      where: {
        deletedAt: null
      },
      data: {
        heart: {
          set: 3
        }
      }
    })
    this.logger.debug(`Reset heart for ${addHeartUser.count} users!.`)
  }
}
