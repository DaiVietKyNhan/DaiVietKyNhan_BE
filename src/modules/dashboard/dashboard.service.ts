import { ENTITY_MESSAGE } from '@/common/constants/message'
import { HttpStatus, Injectable } from '@nestjs/common'

import { DashboardRepo } from './dashboard.repo'

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepo) {}

  async getUserPlayStats() {
    const stats = await this.dashboardRepo.getUserPlayStats()
    return {
      statusCode: HttpStatus.OK,
      data: stats,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async getStats() {
    const [
      totalUsers,
      totalUsersLastMonth,
      webVisits,
      webVisitsLastWeek,
      // totalQuestions removed per request
      // newQuestionsThisWeek removed per request
      interactionRate
    ] = await Promise.all([
      this.dashboardRepo.getTotalUsersExcludingAdmin(),
      this.dashboardRepo.getTotalUsersLastMonth(),
      this.dashboardRepo.getWebVisits(),
      this.dashboardRepo.getWebVisitsLastWeek(),
      this.dashboardRepo.getInteractionRate()
    ])

    // Calculate percentage changes
    const userChangePercent =
      totalUsersLastMonth > 0
        ? Math.round(((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100)
        : 0

    const webVisitsChangePercent =
      webVisitsLastWeek > 0
        ? Math.round(((webVisits - webVisitsLastWeek) / webVisitsLastWeek) * 100)
        : 0

    // Compute user play / not play (godProfile presence)
    const [usersWithGodProfile, usersWithoutGodProfile] = await Promise.all([
      this.dashboardRepo.getUsersCountByGodProfile(true),
      this.dashboardRepo.getUsersCountByGodProfile(false)
    ])
    console.log('usersWithGodProfile: ', usersWithGodProfile)
    console.log('usersWithoutGodProfile: ', usersWithoutGodProfile)

    const totalUsersValue = totalUsers

    const userPlayPercent =
      totalUsersValue > 0
        ? Math.round((usersWithGodProfile / totalUsersValue) * 1000) / 10
        : 0
    const userNotPlayPercent =
      totalUsersValue > 0
        ? Math.round((usersWithoutGodProfile / totalUsersValue) * 1000) / 10
        : 0

    // Calculate previous month's end date for comparison
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() // 0-based current month
    const endOfPrevMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const [
      prevUsersWithGodProfileAsOf,
      prevUsersWithoutGodProfileAsOf,
      prevTotalUsersAsOf
    ] = await Promise.all([
      this.dashboardRepo.getUsersCountByGodProfileAsOfDate(true, endOfPrevMonth),
      this.dashboardRepo.getUsersCountByGodProfileAsOfDate(false, endOfPrevMonth),
      this.dashboardRepo.getTotalUsersExcludingAdminAsOfDate(endOfPrevMonth)
    ])

    const prevUserPlayPercent =
      prevTotalUsersAsOf > 0
        ? Math.round((prevUsersWithGodProfileAsOf / prevTotalUsersAsOf) * 1000) / 10
        : 0
    const prevUserNotPlayPercent =
      prevTotalUsersAsOf > 0
        ? Math.round((prevUsersWithoutGodProfileAsOf / prevTotalUsersAsOf) * 1000) / 10
        : 0

    const userPlayChange =
      prevUserPlayPercent > 0
        ? Math.round(
            ((userPlayPercent - prevUserPlayPercent) / prevUserPlayPercent) * 100 * 10
          ) / 10
        : 0

    const userNotPlayChange =
      prevUserNotPlayPercent > 0
        ? Math.round(
            ((userNotPlayPercent - prevUserNotPlayPercent) / prevUserNotPlayPercent) *
              100 *
              10
          ) / 10
        : 0

    const stats = {
      totalUsers: {
        value: totalUsersValue,
        change: `${userChangePercent > 0 ? '+' : ''}${userChangePercent}% từ tháng trước`,
        title: 'Tổng người dùng'
      },
      webVisits: {
        value: webVisits,
        change: `${webVisitsChangePercent > 0 ? '+' : ''}${webVisitsChangePercent}% từ tháng trước`,
        title: 'Lượt truy cập Web'
      },
      userNotPlay: {
        value: `${userNotPlayPercent}%`,
        change: `${userNotPlayChange > 0 ? '+' : ''}${userNotPlayChange}% so với tháng trước`,
        title: 'Tương tác'
      },
      userPlay: {
        value: `${userPlayPercent}%`,
        change: `${userPlayChange > 0 ? '+' : ''}${userPlayChange}% so với tháng trước`,
        title: 'Tương tác'
      }
    }

    return {
      statusCode: HttpStatus.OK,
      data: stats,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async getQuestionStats() {
    const questionStats = await this.dashboardRepo.getQuestionStats()
    return {
      statusCode: HttpStatus.OK,
      data: questionStats,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async getPointsStats() {
    const pointsStats = await this.dashboardRepo.getPointsStats()
    return {
      statusCode: HttpStatus.OK,
      data: pointsStats,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async getUserStatsMonth() {
    const monthlyStats = await this.dashboardRepo.getUserStatsByMonth()
    return {
      statusCode: HttpStatus.OK,
      data: monthlyStats,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async getGameUserStats() {
    const topPlayers = await this.dashboardRepo.getTopPlayers(10)
    return {
      statusCode: HttpStatus.OK,
      data: topPlayers,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async getLandStats() {
    const landStats = await this.dashboardRepo.getLandStatistics()
    return {
      statusCode: HttpStatus.OK,
      data: landStats,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }
}
