import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import {
  BulkUpdateLetterBodyDTO,
  BulkUpdateLetterResDTO,
  CreateLetterBodyDTO,
  CreateLetterResDTO,
  GetLetterListResDTO,
  GetLetterParamsDTO,
  GetLetterResDTO,
  ListLetterQueryDTO,
  UpdateLetterFullBodyDTO,
  UpdateLetterResDTO
} from './dto/letter.zod-dto'
import { LetterService } from './letter.service'
import { IsPublic } from '@/common/decorators/auth.decorator'

@ApiTags('Letter - Gửi thư')
@Controller('letter')
@ApiBearerAuth()
export class LetterController {
  constructor(private readonly letterService: LetterService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thư với phân trang' })
  @ZodSerializerDto(PaginationResponseSchema)
  @IsPublic()
  list(
    @Query() query: ListLetterQueryDTO,
    @ActiveUser('userId') userId: number,
    @ActiveUser('roleName') roleName: string
  ) {
    // Debug: log the raw query to see what we're receiving
    console.log(
      'Controller - Raw query.filterByUserId:',
      query.filterByUserId,
      'type:',
      typeof query.filterByUserId
    )

    // Manually parse filterByUserId to handle edge cases
    // This ensures we get the correct boolean value regardless of Zod parsing
    const rawFilterByUserId = (query as any).filterByUserId
    let filterByUserId: boolean = true // Default to true

    if (rawFilterByUserId !== undefined && rawFilterByUserId !== null) {
      if (typeof rawFilterByUserId === 'boolean') {
        filterByUserId = rawFilterByUserId
      } else if (typeof rawFilterByUserId === 'string') {
        const lowerVal = rawFilterByUserId.toLowerCase().trim()
        if (lowerVal === 'false' || lowerVal === '0' || lowerVal === 'no') {
          filterByUserId = false
        } else if (lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes') {
          filterByUserId = true
        } else {
          // Invalid value - log warning but default to true for safety
          console.warn(
            `Invalid filterByUserId value: "${rawFilterByUserId}". Defaulting to true. Use "true" or "false".`
          )
          filterByUserId = true
        }
      } else {
        filterByUserId = Boolean(rawFilterByUserId)
      }
    }
    // If undefined/null, keep default true

    console.log(
      'Controller - Raw value:',
      rawFilterByUserId,
      'Parsed filterByUserId:',
      filterByUserId
    )

    // Create new query object with parsed value
    const parsedQuery: ListLetterQueryDTO = { ...query, filterByUserId }
    return this.letterService.list(parsedQuery, userId, roleName)
  }

  @Post()
  @ApiOperation({
    summary: 'Gửi thư mới',
    description:
      'Gửi thư cho kỳ nhân. Thư sẽ có status PENDING, admin sẽ duyệt và chuyển sang PUBLIC'
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi thư thành công',
    type: CreateLetterResDTO
  })
  @ZodSerializerDto(CreateLetterResDTO)
  create(@Body() body: CreateLetterBodyDTO, @ActiveUser('userId') userId: number) {
    return this.letterService.create({
      ...body,
      fromUserId: userId
    })
  }

  @Get('sent')
  @ApiOperation({ summary: 'Lấy danh sách thư đã gửi' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: GetLetterListResDTO
  })
  @ZodSerializerDto(GetLetterListResDTO)
  getSentLetters(@ActiveUser('userId') userId: number) {
    return this.letterService.getSentLetters(userId)
  }

  @Get('by-to/:toName')
  @ApiOperation({ summary: 'Lấy tất cả thư gửi cho tên người nhận' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: GetLetterListResDTO
  })
  @ZodSerializerDto(GetLetterListResDTO)
  getLettersByToName(@Param('toName') toName: string) {
    return this.letterService.getLettersByToName(toName)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số lượng thư chưa đọc' })
  @ApiResponse({
    status: 200,
    description: 'Lấy số lượng thành công'
  })
  getUnreadCount(@ActiveUser('userId') userId: number) {
    return this.letterService.getUnreadCount(userId)
  }

  @Get(':letterId')
  @ApiOperation({ summary: 'Lấy chi tiết thư' })
  @IsPublic()
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết thành công',
    type: GetLetterResDTO
  })
  @ZodSerializerDto(GetLetterResDTO)
  findById(@Param() params: GetLetterParamsDTO, @ActiveUser('userId') userId: number) {
    return this.letterService.findById(params.letterId, userId)
  }

  @Delete(':letterId')
  @ApiOperation({ summary: 'Xóa thư' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thư thành công',
    type: MessageResDTO
  })
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetLetterParamsDTO, @ActiveUser('userId') userId: number) {
    return this.letterService.delete(params.letterId, userId)
  }

  @Put('status')
  @ApiOperation({
    summary: 'Cập nhật status nhiều thư cùng lúc (Admin only)',
    description:
      'Admin có thể cập nhật status nhiều thư cùng lúc. Nếu chuyển từ PENDING sang PUBLIC và đây là lần đầu tiên user có thư PUBLIC, thưởng 200 xu'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật status thành công',
    type: BulkUpdateLetterResDTO
  })
  @ZodSerializerDto(BulkUpdateLetterResDTO)
  bulkUpdateStatus(
    @Body() body: BulkUpdateLetterBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.letterService.bulkUpdateStatus(body.letters, body.status, userId)
  }

  @Put(':letterId')
  @ApiOperation({
    summary: 'Cập nhật đầy đủ thông tin thư (Admin only)',
    description:
      'Admin có thể cập nhật đầy đủ các field của thư: from, to, content, status, isFirstPublic'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: UpdateLetterResDTO
  })
  @ZodSerializerDto(UpdateLetterResDTO)
  updateFull(
    @Param() params: GetLetterParamsDTO,
    @Body() body: UpdateLetterFullBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.letterService.updateFull(params.letterId, body, userId)
  }
}
