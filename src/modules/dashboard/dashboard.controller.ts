import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { DashboardStatsResDTO } from './dto/dashboard.zod-dto'
import { DashboardService } from './dashboard.service'

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Lấy thống kê dashboard' })
    @ApiResponse({
        status: 200,
        description: 'Lấy thống kê dashboard thành công',
        type: DashboardStatsResDTO
    })
    @ZodSerializerDto(DashboardStatsResDTO)
    getStats() {
        return this.dashboardService.getStats()
    }
}