import { BullAction, BullQueue } from '@/common/constants/bull-action.constant'
import { PrismaService } from '@/shared/services/prisma.service'
import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bull'

@Processor(BullQueue.ROLE_ACTIVATION) // queue riêng cho role
@Injectable()
export class SharedRoleActivationProcessor {
  private readonly logger = new Logger(SharedRoleActivationProcessor.name)

  constructor(private readonly prisma: PrismaService) {}

  @Process(BullAction.UPDATE_STATUS_ROLE)
  async handleActivation(
    job: Job<{ roleId: number; systemConfigId: number }>
  ): Promise<void> {
    const { roleId } = job.data
    console.log(`Kích hoạt vai trò với ID: ${roleId}`)
    console.log(`Kích hoạt vai trò với ID: ${job.data.systemConfigId}`)
    try {
      await this.prisma.role.update({
        where: { id: roleId },
        data: { isActive: true }
      })
      //update system config do isActive = false
      await this.prisma.systemConfig.updateMany({
        where: { id: job.data.systemConfigId },
        data: { isActive: false }
      })

      // add xu cho user
      const users = await this.prisma.user.findMany({
        where: {
          roleId,
          deletedAt: null
        },
        select: {
          id: true
        }
      })
      const count = users.length
      await this.prisma.user.updateMany({
        where: { roleId, deletedAt: null },
        data: { coin: { increment: count } }
      })
      this.logger.log(`Role ${roleId} đã được active thành công`)
    } catch (error) {
      this.logger.error(`Lỗi khi active role ${roleId}: ${error.message}`, error.stack)
    }
  }
}
