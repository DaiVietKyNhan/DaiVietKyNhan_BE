import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { DashboardService } from './dashboard.service'
import { DashboardStatsResDTO, QuestionStatsResDTO } from './dto/dashboard.zod-dto'

@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ZodSerializerDto(DashboardStatsResDTO)
  getStats() {
    return this.dashboardService.getStats()
  }

  @Get('questions/stats')
  @ZodSerializerDto(QuestionStatsResDTO)
  getQuestionStats() {
    return this.dashboardService.getQuestionStats()
  }
}
