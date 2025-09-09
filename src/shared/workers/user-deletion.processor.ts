import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '@/shared/services/prisma.service';

@Processor('user-deletion')
export class SharedUserDeletionProcessor {
    constructor(private readonly prisma: PrismaService) { }

    @Process('delete-inactive-user')
    async handleDeletion(job: Job<{ userId: number }>): Promise<void> {
        const { userId } = job.data;
        await this.prisma.user.deleteMany({
            where: { id: userId, status: 'INACTIVE', deletedAt: null },
        });
    }
}


