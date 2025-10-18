import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { DashboardStatsResDTO } from './dto/dashboard.zod-dto'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ZodSerializerDto(DashboardStatsResDTO)
    getStats() {
        return this.dashboardService.getStats()
    }
}