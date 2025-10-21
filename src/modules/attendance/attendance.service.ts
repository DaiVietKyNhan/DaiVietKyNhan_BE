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
import { WeekDay, WeekDayType } from '@/common/constants/attendence-config.constant'
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
      if (attendenceConfig.dayOfWeek === WeekDay.SUNDAY) {
        isStreakSunday =
          (await this.findStreakDate(createdById, date)).count >= 6 ? true : false
      }

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
    // 1️⃣ Xác định đầu và cuối tuần (T2 → CN)
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1) // T2
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // 2️⃣ Lấy tất cả điểm danh trong tuần
    let attendances = await this.attendanceRepo.findStreakWithStartEndDay(
      userId,
      startOfWeek,
      endOfWeek
    )

    if (addDayOfWeek) {
      const attendancesWithDay: AttendanceWithDayOfWeekType[] = attendances.map(
        (att) => ({
          ...att,
          dayOfWeek: getWeekDay(att.date) // dùng hàm bạn đã viết
        })
      )
      attendances = attendancesWithDay
    }

    const count = attendances.length
    const isFullWeek = count >= 7

    return { count, isFullWeek, attendances }
  }
}
