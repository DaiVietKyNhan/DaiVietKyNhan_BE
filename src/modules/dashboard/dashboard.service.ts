import { ENTITY_MESSAGE } from '@/common/constants/message'
import { HttpStatus, Injectable } from '@nestjs/common'

import { DashboardRepo } from './dashboard.repo'

@Injectable()
export class DashboardService {
    constructor(private readonly dashboardRepo: DashboardRepo) { }

    async getStats() {
        const [
            totalUsers,
            totalUsersLastMonth,
            webVisits,
            webVisitsLastWeek,
            totalQuestions,
            newQuestionsThisWeek,
            interactionRate
        ] = await Promise.all([
            this.dashboardRepo.getTotalUsers(),
            this.dashboardRepo.getTotalUsersLastMonth(),
            this.dashboardRepo.getWebVisits(),
            this.dashboardRepo.getWebVisitsLastWeek(),
            this.dashboardRepo.getTotalQuestions(),
            this.dashboardRepo.getNewQuestionsThisWeek(),
            this.dashboardRepo.getInteractionRate()
        ])

        // Calculate percentage changes
        const userChangePercent = totalUsersLastMonth > 0
            ? Math.round(((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100)
            : 0

        const webVisitsChangePercent = webVisitsLastWeek > 0
            ? Math.round(((webVisits - webVisitsLastWeek) / webVisitsLastWeek) * 100)
            : 0

        const stats = {
            totalUsers: {
                value: totalUsers,
                change: `${userChangePercent > 0 ? '+' : ''}${userChangePercent}% từ tháng trước`,
                title: 'Tổng người dùng'
            },
            webVisits: {
                value: webVisits,
                change: `${webVisitsChangePercent > 0 ? '+' : ''}${webVisitsChangePercent}% từ tuần trước`,
                title: 'Lượt truy cập Web'
            },
            questions: {
                value: totalQuestions,
                change: `+${newQuestionsThisWeek} câu hỏi mới`,
                title: 'Câu hỏi'
            },
            interaction: {
                value: `${interactionRate}%`,
                change: 'Tỷ lệ tham gia',
                title: 'Tương tác'
            }
        }

        return {
            statusCode: HttpStatus.OK,
            data: stats,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }
}