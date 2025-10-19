import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { DashboardService } from './dashboard.service'
import {
  DashboardStatsResDTO,
  LandStatsResDTO,
  PointsStatsResDTO,
  QuestionStatsResDTO,
  TopPlayersResDTO,
  UserPlayStatsResDTO,
  UserStatsResDTO
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

  @Get('user-play/stats')
  @ZodSerializerDto(UserPlayStatsResDTO)
  getUserPlayStats() {
    return this.dashboardService.getUserPlayStats()
  }

  @Get('user-play/months')
  @ZodSerializerDto(UserStatsResDTO)
  getUserStatsMonth() {
    return this.dashboardService.getUserStatsMonth()
  }

  @Get('user-play/top-user/stats')
  @ZodSerializerDto(TopPlayersResDTO)
  getGameUserStats() {
    return this.dashboardService.getGameUserStats()
  }

  @Get('user-play/land/stats')
  @ZodSerializerDto(LandStatsResDTO)
  getLandStats() {
    return this.dashboardService.getLandStats()
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
