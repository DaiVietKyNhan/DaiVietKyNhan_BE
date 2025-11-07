import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import {
    CreateLetterBodyDTO,
    CreateLetterResDTO,
    GetLetterListResDTO,
    GetLetterParamsDTO,
    GetLetterResDTO,
    UpdateLetterBodyDTO,
    UpdateLetterResDTO,
    UpdateLetterFullBodyDTO,
    BulkUpdateLetterBodyDTO,
    BulkUpdateLetterResDTO
} from './dto/letter.zod-dto'
import { LETTER_ERROR_MESSAGE } from './dto/letter.error'
import { LetterService } from './letter.service'

@ApiTags('Letter - Gửi thư')
@Controller('letter')
@ApiBearerAuth()
export class LetterController {
    constructor(private readonly letterService: LetterService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách thư với phân trang' })
    @ZodSerializerDto(PaginationResponseSchema)
    list(@Query() query: PaginationQueryDTO) {
        return this.letterService.list(query)
    }

    @Post()
    @ApiOperation({
        summary: 'Gửi thư mới',
        description: 'Gửi thư cho kỳ nhân. Thư sẽ có status PENDING, admin sẽ duyệt và chuyển sang PUBLIC'
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
        description: 'Admin có thể cập nhật status nhiều thư cùng lúc. Nếu chuyển từ PENDING sang PUBLIC và đây là lần đầu tiên user có thư PUBLIC, thưởng 200 xu'
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
        description: 'Admin có thể cập nhật đầy đủ các field của thư: from, to, content, status, isFirstPublic'
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

