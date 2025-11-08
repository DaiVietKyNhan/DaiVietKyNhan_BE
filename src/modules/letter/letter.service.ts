import { ENTITY_MESSAGE } from '@/common/constants/message'
import { RoleName } from '@/common/constants/role.constant'
import { PrismaService } from '@/shared/services/prisma.service'
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common'

import { PaginationQueryType } from '@/shared/models/request.model'
import { LETTER_ERROR_MESSAGE } from './dto/letter.error'
import { LetterRepo } from './letter.repo'
import { LetterStatus } from '@prisma/client'

@Injectable()
export class LetterService {
  constructor(
    private readonly letterRepo: LetterRepo,
    private readonly prismaService: PrismaService
  ) { }

  /**
   * Tạo thư mới
   */
  async create(data: { from: string; to: string; content: string; fromUserId: number }) {
    const { from, to, content, fromUserId } = data

    try {
      console.log(`=== CREATING LETTER ===`)
      console.log(`Data received:`, { from, to, content, fromUserId })

      // Kiểm tra user có tồn tại không
      const user = await this.prismaService.user.findUnique({
        where: { id: fromUserId }
      })
      console.log(`User found:`, user ? user.name : 'NOT FOUND')

      if (!user) {
        throw new NotFoundException(LETTER_ERROR_MESSAGE.USER_NOT_FOUND)
      }

      // Tạo thư
      console.log(`Creating letter with data:`, {
        fromUserId,
        from,
        to,
        content,
        status: 'PENDING'
      })
      const letter = await this.letterRepo.create({
        fromUser: {
          connect: { id: fromUserId }
        },
        from,
        to,
        content,
        status: 'PENDING'
      })
      console.log(`Letter created successfully with ID:`, letter.id)

      return {
        statusCode: 201,
        data: letter,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      console.error(`=== LETTER CREATION ERROR ===`)
      console.error(`Error:`, error)
      console.error(`Stack trace:`, error.stack)
      console.error(`================================`)
      throw error
    }
  }

  /**
   * Lấy thông tin thư theo ID
   */
  async findById(id: number, userId: number) {
    const letter = await this.letterRepo.findById(id)

    if (!letter) {
      throw new NotFoundException(LETTER_ERROR_MESSAGE.LETTER_NOT_FOUND)
    }

    // Kiểm tra quyền truy cập (chỉ người gửi mới xem được)
    // if (letter.fromUserId !== userId) {
    //   throw new ForbiddenException(LETTER_ERROR_MESSAGE.UNAUTHORIZED_ACCESS)
    // }

    return {
      statusCode: 200,
      data: letter,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  /**
   * Lấy danh sách thư đã gửi
   */
  async getSentLetters(userId: number) {
    const letters = await this.letterRepo.findByUserId(userId)

    return {
      statusCode: 200,
      data: letters,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  /**
   * Lấy tất cả thư gửi cho tên người nhận
   */
  async getLettersByToName(toName: string) {
    const letters = await this.letterRepo.findByToName(toName)

    return {
      statusCode: 200,
      data: letters,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }



  /**
   * Xóa thư
   */
  async delete(id: number, userId: number) {
    const letter = await this.letterRepo.findById(id)

    if (!letter) {
      throw new NotFoundException(LETTER_ERROR_MESSAGE.LETTER_NOT_FOUND)
    }

    // Chỉ người gửi mới có thể xóa
    if (letter.fromUserId !== userId) {
      throw new ForbiddenException(LETTER_ERROR_MESSAGE.UNAUTHORIZED_ACCESS)
    }

    await this.letterRepo.delete(id, userId)

    return {
      statusCode: 200,
      message: ENTITY_MESSAGE.DELETE_SUCCESS
    }
  }

  /**
   * Lấy số lượng thư chưa đọc
   */
  async getUnreadCount(userId: number) {
    const count = await this.letterRepo.getUnreadCount(userId)

    return {
      statusCode: 200,
      data: { unreadCount: count },
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  /**
   * Lấy danh sách thư với phân trang
   */
  async list(pagination: PaginationQueryType) {
    const data = await this.letterRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  /**
   * Cập nhật đầy đủ thông tin thư (chỉ admin)
   */
  async updateFull(
    id: number,
    data: {
      from?: string
      to?: string
      content?: string
      status?: LetterStatus
      isFirstPublic?: boolean
    },
    adminUserId: number
  ) {
    // Kiểm tra admin
    const admin = await this.prismaService.user.findUnique({
      where: { id: adminUserId },
      include: { role: true }
    })

    if (!admin || admin.role.name !== RoleName.Admin) {
      throw new ForbiddenException(LETTER_ERROR_MESSAGE.ADMIN_ONLY)
    }

    // Lấy thư hiện tại
    const letter = await this.letterRepo.findById(id)
    if (!letter) {
      throw new NotFoundException(LETTER_ERROR_MESSAGE.LETTER_NOT_FOUND)
    }

    // Cập nhật thư
    const updatedLetter = await this.letterRepo.update(id, data)

    return {
      statusCode: 200,
      data: updatedLetter,
      message: ENTITY_MESSAGE.UPDATE_SUCCESS
    }
  }

  /**
   * Cập nhật status của nhiều thư cùng lúc (chỉ admin)
   * Nếu chuyển từ PENDING sang PUBLIC và đây là lần đầu tiên user có thư PUBLIC, thưởng 200 xu
   */
  async bulkUpdateStatus(
    letters: Array<{ letterId: number; fromUserId: number }>,
    status: LetterStatus,
    adminUserId: number
  ) {
    // Kiểm tra admin
    const admin = await this.prismaService.user.findUnique({
      where: { id: adminUserId },
      include: { role: true }
    })

    if (!admin || admin.role.name !== RoleName.Admin) {
      throw new ForbiddenException(LETTER_ERROR_MESSAGE.ADMIN_ONLY)
    }

    // Validate tất cả thư tồn tại và thuộc về user đúng
    const letterIds = letters.map((l) => l.letterId)
    const existingLetters = await this.prismaService.letter.findMany({
      where: {
        id: { in: letterIds },
        deletedAt: null
      }
    })

    if (existingLetters.length !== letterIds.length) {
      throw new NotFoundException(LETTER_ERROR_MESSAGE.LETTER_NOT_FOUND)
    }

    // Kiểm tra từng thư có thuộc về user đúng không
    for (const letter of letters) {
      const foundLetter = existingLetters.find((l) => l.id === letter.letterId)
      if (!foundLetter) {
        throw new NotFoundException(LETTER_ERROR_MESSAGE.LETTER_NOT_FOUND)
      }
      if (foundLetter.fromUserId !== letter.fromUserId) {
        throw new ForbiddenException(LETTER_ERROR_MESSAGE.UNAUTHORIZED_ACCESS)
      }
    }

    const newStatus = status

    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const results = await this.prismaService.$transaction(async (tx) => {
      const updatedLetters: Array<{
        id: number
        fromUserId: number
        from: string
        to: string
        content: string
        status: LetterStatus
        isFirstPublic: boolean
        createdAt: Date
        updatedAt: Date
        deletedAt: Date | null
        deletedById: number | null
        fromUser: {
          id: number
          name: string
          avatar: string | null
        }
      }> = []
      const rewardedUsers = new Set<number>() // Track users đã được thưởng để tránh thưởng 2 lần
      const publicLettersInBatch = new Map<number, number[]>() // Track thư PUBLIC trong batch theo userId: [letterIds]

      // Cập nhật từng thư
      for (const letterItem of letters) {
        const letter = existingLetters.find((l) => l.id === letterItem.letterId)!
        const oldStatus = letter.status

        // Cập nhật status
        const updatedLetter = await tx.letter.update({
          where: { id: letterItem.letterId },
          data: { status: newStatus },
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        })

        updatedLetters.push(updatedLetter)

        // Track thư đã được update sang PUBLIC trong batch này
        if (oldStatus === 'PENDING' && newStatus === 'PUBLIC') {
          if (!publicLettersInBatch.has(letterItem.fromUserId)) {
            publicLettersInBatch.set(letterItem.fromUserId, [])
          }
          publicLettersInBatch.get(letterItem.fromUserId)!.push(letterItem.letterId)
        }
      }

      // Xử lý thưởng cho từng user (chỉ 1 lần cho mỗi user)
      for (const [userId, publicLetterIds] of publicLettersInBatch.entries()) {
        // Kiểm tra xem user đã có thư PUBLIC nào với isFirstPublic = true chưa
        // Cần check cả các thư đang update trong batch (trước khi update) để tránh trường hợp
        // thư đã có isFirstPublic = true, sau đó bị update thành PENDING rồi lại thành PUBLIC
        const lettersToCheck = existingLetters.filter(l =>
          l.fromUserId === userId && l.isFirstPublic === true
        )
        const existingFirstPublic = lettersToCheck.length > 0

        // Nếu chưa có thư PUBLIC đầu tiên nào (không tính các thư đã có isFirstPublic = true trước đó),
        // đánh dấu thư đầu tiên trong batch và thưởng 200 xu
        if (!existingFirstPublic) {
          // Kiểm tra thêm trong database (ngoài batch) xem user đã có thư isFirstPublic = true chưa
          const dbFirstPublic = await tx.letter.findFirst({
            where: {
              fromUserId: userId,
              isFirstPublic: true,
              deletedAt: null,
              id: { notIn: letterIds } // Không tính các thư đang update trong batch
            }
          })

          // Nếu chưa có thư PUBLIC đầu tiên nào, đánh dấu và thưởng
          if (!dbFirstPublic) {
            // Đánh dấu thư đầu tiên trong batch là thư PUBLIC đầu tiên
            const firstLetterId = publicLetterIds[0]
            await tx.letter.update({
              where: { id: firstLetterId },
              data: { isFirstPublic: true }
            })

            // Cập nhật lại updatedLetter trong mảng để có isFirstPublic = true
            const letterIndex = updatedLetters.findIndex((l) => l.id === firstLetterId)
            if (letterIndex !== -1) {
              updatedLetters[letterIndex].isFirstPublic = true
            }

            // Thưởng 200 xu
            await tx.user.update({
              where: { id: userId },
              data: {
                coin: {
                  increment: 200
                }
              }
            })
            rewardedUsers.add(userId)
            console.log(`User ${userId} nhận 200 xu cho lần đầu có thư PUBLIC (thư ID: ${firstLetterId})`)
          }
        }
      }

      return updatedLetters
    })

    return {
      statusCode: 200,
      data: results,
      message: ENTITY_MESSAGE.UPDATE_SUCCESS
    }
  }




}
