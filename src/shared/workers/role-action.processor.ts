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
  async handleActivation(job: Job<{ roleId: number }>): Promise<void> {
    const { roleId } = job.data
    console.log(`Kích hoạt vai trò với ID: ${roleId}`)
    try {
      await this.prisma.role.update({
        where: { id: roleId },
        data: { isActive: true }
      })
      this.logger.log(`Role ${roleId} đã được active thành công`)
    } catch (error) {
      this.logger.error(`Lỗi khi active role ${roleId}: ${error.message}`, error.stack)
    }
  }
}
