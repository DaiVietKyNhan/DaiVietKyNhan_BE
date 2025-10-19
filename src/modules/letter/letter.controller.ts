import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
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
    UpdateLetterResDTO
} from './dto/letter.zod-dto'
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
        description: 'Gửi thư cho kỳ nhân. Lần đầu tiên gửi thư (bất kể gửi cho ai) sẽ nhận 200 xu'
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

    @Get('by-kynhan/:kyNhanId')
    @ApiOperation({ summary: 'Lấy tất cả thư gửi cho kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách thành công',
        type: GetLetterListResDTO
    })
    @ZodSerializerDto(GetLetterListResDTO)
    getLettersByKyNhan(@Param('kyNhanId') kyNhanId: string) {
        return this.letterService.getLettersByKyNhan(parseInt(kyNhanId))
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

    @Put(':letterId/mark-read')
    @ApiOperation({ summary: 'Đánh dấu thư đã đọc' })
    @ApiResponse({
        status: 200,
        description: 'Đánh dấu thành công',
        type: UpdateLetterResDTO
    })
    @ZodSerializerDto(UpdateLetterResDTO)
    markAsRead(@Param() params: GetLetterParamsDTO, @ActiveUser('userId') userId: number) {
        return this.letterService.markAsRead(params.letterId, userId)
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
}

