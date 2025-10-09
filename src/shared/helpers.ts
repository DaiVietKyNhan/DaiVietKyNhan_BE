import { WeekDay, WeekDayType } from '@/common/constants/attendence-config.constant'
import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Type Predicate
export function isUniqueConstraintPrismaError(
  error: any
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(
  error: any
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export function isForeignKeyConstraintPrismaError(
  error: any
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}

export const generateOTP = () => {
  return String(randomInt(100000, 1000000))
}

export const generateRandomFilename = (filename: string) => {
  const ext = path.extname(filename)
  return `${uuidv4()}${ext}`
}

export function getWeekDay(date: Date): WeekDayType {
  const days: WeekDayType[] = [
    WeekDay.SUNDAY, // 0
    WeekDay.MONDAY, // 1
    WeekDay.TUESDAY, // 2
    WeekDay.WEDNESDAY, // 3
    WeekDay.THURSDAY, // 4
    WeekDay.FRIDAY, // 5
    WeekDay.SATURDAY // 6
  ]

  return days[date.getDay()]
}
