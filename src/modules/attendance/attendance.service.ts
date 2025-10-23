import { ATTENDANCE_MESSAGE, ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import {
  getWeekDay,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'

import { AttendancesStatus } from '@/common/constants/attendance.constant'
import { WeekDayType } from '@/common/constants/attendence-config.constant'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { AttendenceConfigRepo } from '../attendence-config/attendence-config.repo'
import { AttendanceRepo } from './attendence.repo'
import { AttendancegAlreadyExistsException } from './dto/attendance.error'
import {
  AttendanceType,
  CreateAttendanceBodyType,
  UpdateAttendanceBodyType
} from './entities/attendance.entity'
type AttendanceWithDayOfWeekType = AttendanceType & { dayOfWeek: WeekDayType }
@Injectable()
export class AttendanceService {
  constructor(
    private attendanceRepo: AttendanceRepo,
    private attendanceConfigRepo: AttendenceConfigRepo,
    private shareUserRepo: SharedUserRepository
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.attendanceRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendance = await this.attendanceRepo.findById(id)
    if (!attendance) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: attendance,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async findByUser(userId: number, date: Date = new Date()) {
    console.log(date)

    const attendances = await this.findStreakDate(userId, date, true)
    const userInfo = await this.shareUserRepo.findUnique({ id: userId })
    if (!userInfo) {
      throw NotFoundRecordException
    }
    const data = {
      user: userInfo,
      attendances: attendances.attendances,
      count: attendances.count
    }
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  // New: return attendance records of the week containing the given date (Mon-Sun)
  async findByUserWeek(userId: number, date: Date = new Date()) {
    const weekly = await this.findWeekAttendances(userId, date, true)
    const userInfo = await this.shareUserRepo.findUnique({ id: userId })
    if (!userInfo) {
      throw NotFoundRecordException
    }
    const data = {
      user: userInfo,
      attendances: weekly.attendances,
      count: weekly.count
    }
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({ createdById }: { createdById: number }) {
    try {
      // lay ra attendenceConfig co trong ngay hom do
      const date2 = new Date()
      const vnString = date2.toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh'
      })
      const now = new Date()
      const vnDate = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
      )

      // Tạo ngày mới theo múi giờ Việt Nam
      const year = vnDate.getFullYear()
      const month = vnDate.getMonth()
      const day = vnDate.getDate()

      // Set giờ 0h00 tại VN, rồi chuyển sang UTC
      const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))

      const date = utcDate
      console.log(date)

      const getWeekDate = getWeekDay(date)

      const attendenceConfig =
        await this.attendanceConfigRepo.findByDateOfWeek(getWeekDate)

      if (!attendenceConfig) {
        throw NotFoundRecordException
      }
      //check streat chua ?
      let isStreakSunday = false
      const streakData = await this.findStreakDate(createdById, date)
      // Kiểm tra xem có streak liên tiếp >= 6 ngày trước hôm nay không
      isStreakSunday = streakData.count >= 6 ? true : false
      console.log('isStreat: ', isStreakSunday)

      const data: CreateAttendanceBodyType = {
        date,
        status: AttendancesStatus.PRESENT,
        coin: attendenceConfig.baseCoin,
        bonusCoin: isStreakSunday ? attendenceConfig.bonusCoin : 0,
        userId: createdById
      }

      const existing = await this.attendanceRepo.findByUserIdAndDate(createdById, date)

      // Nếu có bản ghi cũ đã xóa mềm → xóa hẳn trước khi tạo
      if (existing && existing.deletedAt) {
        await this.attendanceRepo.delete(
          { id: existing.id, deletedById: createdById },
          true
        )
      }

      const attendance = await this.attendanceRepo.create({
        createdById,
        data: data
      })
      // toi day -> diem danh thanh cong-> tang coin cho user
      if (attendance) {
        await this.shareUserRepo.addCoinByUserId({
          userId: createdById,
          amount: attendance.coin + attendance.bonusCoin
        })
      }
      return {
        statusCode: HttpStatus.CREATED,
        data: attendance,
        message: ATTENDANCE_MESSAGE.CHECKIN_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw AttendancegAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateAttendanceBodyType
    updatedById: number
  }) {
    try {
      const updatedAttendanceg = await this.attendanceRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedAttendanceg,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw AttendancegAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.attendanceRepo.delete({
        id,
        deletedById
      })
      return {
        statusCode: HttpStatus.OK,
        data: null,
        message: ENTITY_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async findStreakDate(userId: number, date: Date, addDayOfWeek: boolean = false) {
    // 1️⃣ Tính streak liên tiếp từ hôm nay trở về trước
    const today = new Date(date)
    today.setHours(0, 0, 0, 0)

    // Lấy tất cả điểm danh của user, sắp xếp theo ngày giảm dần
    const allAttendances = await this.attendanceRepo.findByUserId(userId)

    // Sắp xếp theo ngày giảm dần
    const sortedAttendances = allAttendances
      .filter((att) => {
        const attDate = new Date(att.date)
        attDate.setHours(0, 0, 0, 0)
        return attDate < today // Chỉ lấy các ngày trước hôm nay
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // 2️⃣ Đếm streak liên tiếp
    let streakCount = 0
    let expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - 1) // Bắt đầu từ hôm qua

    const streakAttendances: AttendanceType[] = []

    for (const att of sortedAttendances) {
      const attDate = new Date(att.date)
      attDate.setHours(0, 0, 0, 0)

      if (attDate.getTime() === expectedDate.getTime()) {
        streakCount++
        streakAttendances.push(att)
        // Tiếp tục kiểm tra ngày trước đó
        expectedDate.setDate(expectedDate.getDate() - 1)
      } else if (attDate.getTime() < expectedDate.getTime()) {
        // Có khoảng trống, dừng streak
        break
      }
    }

    // 3️⃣ Thêm dayOfWeek nếu cần
    let attendances: any[] = streakAttendances
    if (addDayOfWeek) {
      const attendancesWithDay: AttendanceWithDayOfWeekType[] = streakAttendances.map(
        (att) => ({
          ...att,
          dayOfWeek: getWeekDay(att.date)
        })
      )
      attendances = attendancesWithDay
    }

    const count = streakCount
    const isFullWeek = count >= 7

    return { count, isFullWeek, attendances }
  }

  // Helper: get all attendances in the week (Mon-Sun) of the given date
  async findWeekAttendances(userId: number, date: Date, addDayOfWeek: boolean = false) {
    // Determine start (Mon) and end (Sun) of the week for the given date
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1) // Monday
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
    endOfWeek.setHours(23, 59, 59, 999)

    let attendances = await this.attendanceRepo.findStreakWithStartEndDay(
      userId,
      startOfWeek,
      endOfWeek
    )

    if (addDayOfWeek) {
      const attendancesWithDay: AttendanceWithDayOfWeekType[] = attendances.map(
        (att) => ({
          ...att,
          dayOfWeek: getWeekDay(att.date)
        })
      )
      attendances = attendancesWithDay as any
    }

    const count = attendances.length
    const isFullWeek = count >= 7

    return { count, isFullWeek, attendances }
  }
}
