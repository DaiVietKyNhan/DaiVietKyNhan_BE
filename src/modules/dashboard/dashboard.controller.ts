import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { DashboardService } from './dashboard.service'
import {
  DashboardStatsResDTO,
  PointsStatsResDTO,
  QuestionStatsResDTO
} from './dto/dashboard.zod-dto'

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('questions/stats')
  @ZodSerializerDto(QuestionStatsResDTO)
  getQuestionStats() {
    return this.dashboardService.getQuestionStats()
  }

  @Get('point/stats')
  @ZodSerializerDto(PointsStatsResDTO)
  getPointsStats() {
    return this.dashboardService.getPointsStats()
  }

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
