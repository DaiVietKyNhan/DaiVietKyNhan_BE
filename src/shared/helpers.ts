import { WeekDay, WeekDayType } from '@/common/constants/attendence-config.constant'
import {
  AnswerScaleType,
  TestQuestionHomeType
} from '@/common/constants/text-question-home.constant'
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

export function isRecordNotFoundOnConnectPrismaError(
  error: any
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2018'
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

export function getPointHome(
  answer: (typeof AnswerScaleType)[keyof typeof AnswerScaleType],
  typeQuestion: (typeof TestQuestionHomeType)[keyof typeof TestQuestionHomeType]
): number {
  // Map điểm cho NORMAL
  const normalPoints: Record<
    (typeof AnswerScaleType)[keyof typeof AnswerScaleType],
    number
  > = {
    [AnswerScaleType.STRONGLY_DISAGREE]: 0,
    [AnswerScaleType.DISAGREE]: 1,
    [AnswerScaleType.NEUTRAL]: 2,
    [AnswerScaleType.AGREE]: 3,
    [AnswerScaleType.STRONGLY_AGREE]: 4
  }

  // Nếu CONVERT thì đảo lại
  if (typeQuestion === TestQuestionHomeType.CONVERT) {
    return 4 - normalPoints[answer]
  }

  // NORMAL thì trả luôn
  return normalPoints[answer]
}
