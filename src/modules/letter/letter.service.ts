import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PrismaService } from '@/shared/services/prisma.service'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { LETTER_ERROR_MESSAGE } from './dto/letter.error'
import { LetterRepo } from './letter.repo'

@Injectable()
export class LetterService {
  constructor(
    private readonly letterRepo: LetterRepo,
    private readonly prismaService: PrismaService
  ) {}

  /**
   * Tạo thư mới - Thưởng 200 xu cho lần đầu tiên gửi thư (bất kể gửi cho ai)
   */
  async create(data: { kyNhanId: number; content: string; fromUserId: number }) {
    const { kyNhanId, content, fromUserId } = data

    try {
      console.log(`=== CREATING LETTER ===`)
      console.log(`Data received:`, { kyNhanId, content, fromUserId })

      // Kiểm tra user có tồn tại không
      const user = await this.prismaService.user.findUnique({
        where: { id: fromUserId }
      })
      console.log(`User found:`, user ? user.name : 'NOT FOUND')

      if (!user) {
        throw new NotFoundException('Không tìm thấy User')
      }

      // Kiểm tra kỳ nhân có tồn tại không
      const kyNhan = await this.prismaService.kyNhan.findUnique({
        where: { id: kyNhanId }
      })

      console.log(`KyNhan found:`, kyNhan ? kyNhan.name : 'NOT FOUND')

      if (!kyNhan) {
        throw new NotFoundException('Không tìm thấy Kỳ Nhân')
      }

      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      console.log(`Starting transaction...`)
      const result = await this.prismaService.$transaction(async (tx) => {
        // Đếm tổng số thư đã gửi của user (bất kể gửi cho ai)
        const sentCountBefore = await tx.letter.count({
          where: {
            fromUserId,
            deletedAt: null
          }
        })

        // Lần đầu tiên gửi thư (tổng số thư đã gửi = 0)
        const isFirstLetter = sentCountBefore === 0

        // Tạo thư
        console.log(`Creating letter with data:`, {
          fromUserId,
          kyNhanId,
          content,
          isRead: false
        })
        const letter = await tx.letter.create({
          data: {
            fromUserId,
            kyNhanId,
            content,
            isRead: false
          },
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            kyNhan: {
              select: {
                id: true,
                name: true,
                imgUrl: true
              }
            }
          }
        })
        console.log(`Letter created successfully with ID:`, letter.id)

        // Debug log chi tiết
        console.log(`=== LETTER DEBUG ===`)
        console.log(`User ID: ${fromUserId}`)
        console.log(`KyNhan ID: ${kyNhanId}`)
        console.log(`Total letters sent by user before: ${sentCountBefore}`)
        console.log(`Is first letter ever: ${isFirstLetter}`)
        console.log(`========================`)

        // Nếu là lần gửi đầu tiên, thưởng 200 xu
        if (isFirstLetter) {
          await tx.user.update({
            where: { id: fromUserId },
            data: {
              coin: {
                increment: 200
              }
            }
          })
        }

        return { letter, isFirstLetter }
      })

      console.log(`Transaction completed successfully!`)
      console.log(`Created letter:`, result.letter.id)

      //!  //// Log coin change nếu là lần đầu tiên (ngoài transaction để tránh rollback)
      //// if (result.isFirstLetter) {
      ////   try {
      ////     const currentUser = await this.prismaService.user.findUnique({
      ////       where: { id: fromUserId },
      ////       select: { coin: true }
      ////     })

      //// if (currentUser) {
      ////     await this.prismaService.changePointUserLog.create({
      ////         data: {
      ////             userId: fromUserId,
      ////             newPoint: currentUser.coin,
      // ////             reason: 'Thưởng lần đầu gửi thư',
      ////             createdById: fromUserId
      ////         }
      ////     })
      ////     console.log(`Coin change logged successfully`)
      //// }
      ////   } catch (error) {
      ////     console.log('ChangePointUserLog error, skipping log creation:', error.message)
      ////   }
      ////! }

      return {
        statusCode: 201,
        data: {
          ...result.letter,
          isFirstLetter: result.isFirstLetter
        },
        message: result.isFirstLetter
          ? 'Gửi thư thành công! Bạn nhận được 200 xu cho lần gửi thư đầu tiên! 🎉'
          : ENTITY_MESSAGE.CREATE_SUCCESS
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
    if (letter.fromUserId !== userId) {
      throw new ForbiddenException(LETTER_ERROR_MESSAGE.UNAUTHORIZED_ACCESS)
    }

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
   * Lấy tất cả thư gửi cho kỳ nhân
   */
  async getLettersByKyNhan(kyNhanId: number) {
    const letters = await this.letterRepo.findByKyNhanId(kyNhanId)

    return {
      statusCode: 200,
      data: letters,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  /**
   * Đánh dấu thư đã đọc (người gửi tự đánh dấu)
   */
  async markAsRead(id: number, userId: number) {
    const letter = await this.letterRepo.findById(id)

    if (!letter) {
      throw new NotFoundException(LETTER_ERROR_MESSAGE.LETTER_NOT_FOUND)
    }

    // Chỉ người gửi mới có thể đánh dấu đã đọc
    if (letter.fromUserId !== userId) {
      throw new ForbiddenException(LETTER_ERROR_MESSAGE.UNAUTHORIZED_ACCESS)
    }

    if (letter.isRead) {
      throw new BadRequestException(LETTER_ERROR_MESSAGE.LETTER_ALREADY_READ)
    }

    const updatedLetter = await this.letterRepo.update(id, { isRead: true })

    return {
      statusCode: 200,
      data: updatedLetter,
      message: 'Đánh dấu đã đọc thành công'
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
}
