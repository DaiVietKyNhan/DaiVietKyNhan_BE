import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'

import { DashboardService } from './dashboard.service'
import {
  DashboardStatsResDTO,
  GenderAgesStatsResDTO,
  LandStatsResDTO,
  PointsStatsResDTO,
  QuestionStatsResDTO,
  TopPlayersResDTO,
  UserBehaviorStatsResDTO,
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

  @Get('user/gender-ages')
  @ApiOperation({ summary: 'Get user statistics by gender and age ranges' })
  @ApiResponse({ status: 200, description: 'Get gender and age statistics successfully' })
  @ZodSerializerDto(GenderAgesStatsResDTO)
  getUserStatsGenderAges() {
    return this.dashboardService.getUserStatsGenderAges()
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

  @Get('user/behavior')
  @ApiOperation({
    summary: 'Get user behavior statistics',
    description:
      'Lấy thống kê hành vi người dùng bao gồm: thời gian tương tác trung bình, DAU/MAU/WAU, sự gắn bó người dùng, người dùng mới vs cũ'
  })
  @ApiResponse({
    status: 200,
    description: 'Get user behavior statistics successfully'
  })
  @ZodSerializerDto(UserBehaviorStatsResDTO)
  getStatsUserBehavior() {
    return this.dashboardService.getStatsUserBehavior()
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
