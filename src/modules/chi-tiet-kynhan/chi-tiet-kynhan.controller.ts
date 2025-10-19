import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { PaginationResponseSchema } from '@/shared/models/response.model'
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { CloudinaryImageUploadConfig } from '@/3rdService/upload/cloudinary/multer.config'
import { ZodSerializerDto } from 'nestjs-zod'
import {
    CreateChiTietKyNhanBodyDTO,
    CreateChiTietKyNhanResDTO,
    CreateChiTietKyNhanCompleteBodyDTO,
    CreateChiTietKyNhanCompleteResDTO,
    GetChiTietKyNhanByKyNhanParamsDTO,
    GetChiTietKyNhanListResDTO,
    GetChiTietKyNhanParamsDTO,
    GetChiTietKyNhanResDTO,
    UpdateChiTietKyNhanBodyDTO,
    UpdateChiTietKyNhanResDTO,
    UpdateChiTietKyNhanCompleteBodyDTO,
    UpdateChiTietKyNhanCompleteResDTO
} from './dto/chi-tiet-kynhan.zod-dto'
import { CreateChiTietKyNhanCompleteBodySchema, UpdateChiTietKyNhanCompleteBodySchema } from './entities/chi-tiet-kynhan.entities'
import { ZodError } from 'zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ChiTietKyNhanService } from './chi-tiet-kynhan.service'

@ApiTags('Chi Tiết Kỳ Nhân')
@Controller('chi-tiet-kynhan')
@ApiBearerAuth()
export class ChiTietKyNhanController {
    constructor(private readonly chiTietKyNhanService: ChiTietKyNhanService) { }

    private parseJsonField(field: any, defaultValue: any = []): any {
        if (field === null || field === undefined || field === '') {
            return defaultValue
        }

        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field)
                // Nếu parsed là null/undefined, return defaultValue
                if (parsed === null || parsed === undefined) return defaultValue
                // Nếu parsed là array, return array
                if (Array.isArray(parsed)) return parsed
                // Nếu parsed là object, wrap trong array
                if (parsed && typeof parsed === 'object') return [parsed]
                return defaultValue
            } catch (error) {
                return defaultValue
            }
        }

        // Nếu field không phải string
        if (Array.isArray(field)) return field
        // Nếu field là object và không null, wrap trong array
        if (field && typeof field === 'object') return [field]
        return defaultValue
    }

    private parseJsonFieldOptional(field: any): any {
        if (field === null || field === undefined || field === '') {
            return undefined
        }

        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field)
                // Nếu parsed là null/undefined, return undefined
                if (parsed === null || parsed === undefined) return undefined
                // Nếu parsed là array, return array
                if (Array.isArray(parsed)) return parsed
                // Nếu parsed là object, wrap trong array
                if (parsed && typeof parsed === 'object') return [parsed]
                return undefined
            } catch (error) {
                return undefined
            }
        }

        // Nếu field không phải string
        if (Array.isArray(field)) return field
        // Nếu field là object và không null, wrap trong array
        if (field && typeof field === 'object') return [field]
        return undefined
    }

    private parseFormDataArrays(body: any, fieldName: string): any[] {
        // Kiểm tra xem có field dạng JSON string không
        if (body[fieldName]) {
            return this.parseJsonField(body[fieldName], [])
        }

        // Parse array format như: fieldName[0][key], fieldName[1][key], etc.
        const result: any[] = []
        let index = 0

        while (true) {
            const item: any = {}
            let hasItem = false

            // Tìm tất cả keys cho index này
            for (const key in body) {
                const match = key.match(new RegExp(`^${fieldName}\\[${index}\\]\\[(.+)\\]$`))
                if (match) {
                    const propName = match[1]
                    item[propName] = body[key]
                    hasItem = true
                }
            }

            if (!hasItem) break

            result.push(item)
            index++
        }

        return result.length > 0 ? result : []
    }

    private parseFormDataArraysOptional(body: any, fieldName: string): any[] | undefined {
        // Kiểm tra xem có field dạng JSON string không
        if (body[fieldName]) {
            return this.parseJsonFieldOptional(body[fieldName])
        }

        // Parse array format như: fieldName[0][key], fieldName[1][key], etc.
        const result: any[] = []
        let index = 0

        while (true) {
            const item: any = {}
            let hasItem = false

            // Tìm tất cả keys cho index này
            for (const key in body) {
                const match = key.match(new RegExp(`^${fieldName}\\[${index}\\]\\[(.+)\\]$`))
                if (match) {
                    const propName = match[1]
                    item[propName] = body[key]
                    hasItem = true
                }
            }

            if (!hasItem) break

            result.push(item)
            index++
        }

        return result.length > 0 ? result : undefined
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách thành công'
    })
    @ZodSerializerDto(PaginationResponseSchema)
    list(@Query() query: PaginationQueryDTO) {
        return this.chiTietKyNhanService.list(query)
    }

    @Get(':chiTietKyNhanId')
    @ApiOperation({ summary: 'Lấy chi tiết kỳ nhân theo ID' })
    @ApiResponse({
        status: 200,
        description: 'Lấy chi tiết kỳ nhân thành công',
        type: GetChiTietKyNhanResDTO
    })
    @ZodSerializerDto(GetChiTietKyNhanResDTO)
    findById(@Param() params: GetChiTietKyNhanParamsDTO) {
        return this.chiTietKyNhanService.findById(params.chiTietKyNhanId)
    }

    @Get('ky-nhan/:kyNhanId')
    @ApiOperation({ summary: 'Lấy danh sách chi tiết theo kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách chi tiết theo kỳ nhân thành công',
        type: GetChiTietKyNhanListResDTO
    })
    @ZodSerializerDto(GetChiTietKyNhanListResDTO)
    findByKyNhanId(@Param() params: GetChiTietKyNhanByKyNhanParamsDTO) {
        return this.chiTietKyNhanService.findByKyNhanId(params.kyNhanId)
    }


    @Post('full')
    @ZodSerializerDto(CreateChiTietKyNhanCompleteResDTO)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thuVienAnh', maxCount: 10 }
    ], CloudinaryImageUploadConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Tạo chi tiết kỳ nhân hoàn chỉnh với tất cả thông tin' })
    @ApiResponse({
        status: 201,
        description: 'Tạo chi tiết kỳ nhân hoàn chỉnh thành công',
        type: CreateChiTietKyNhanCompleteResDTO
    })
    createFull(
        @Body() body: any,
        @UploadedFiles() files: {
            thuVienAnh?: Express.Multer.File[]
        },
        @ActiveUser('userId') userId: number
    ) {
        console.log('=== CONTROLLER CREATE FULL ===')
        console.log('Files object:', files)
        console.log('Files keys:', Object.keys(files || {}))
        console.log('thuVienAnh files:', files?.thuVienAnh)
        console.log('thuVienAnh length:', files?.thuVienAnh?.length || 0)
        if (files?.thuVienAnh) {
            console.log('File details:', files.thuVienAnh.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname,
                mimetype: f.mimetype,
                size: f.size
            })))
        }
        console.log('Body keys:', body ? Object.keys(body) : [])
        console.log('Body:', body ? JSON.stringify(body, null, 2) : 'undefined')

        // Parse form data với Zod validation
        const rawData = {
            kyNhanId: body.kyNhanId ? body.kyNhanId.toString().trim() : '',
            thamKhao: body.thamKhao || null,
            boiCanhLichSuVaXuatThan: this.parseFormDataArrays(body, 'boiCanhLichSuVaXuatThan'),
            suSachVietGi: this.parseFormDataArrays(body, 'suSachVietGi'),
            giaiThoaiDanGian: this.parseFormDataArrays(body, 'giaiThoaiDanGian'),
            thuVienAnh: this.parseFormDataArrays(body, 'thuVienAnh')
        }

        try {
            const payload = CreateChiTietKyNhanCompleteBodySchema.parse(rawData)
            console.log('Parsed payload:', JSON.stringify(payload, null, 2))

            return this.chiTietKyNhanService.createFull({
                data: payload,
                createdById: userId,
                thuVienAnhFiles: files?.thuVienAnh || []
            })
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
            }
            throw error
        }
    }

    @Post('upsert')
    @ZodSerializerDto(CreateChiTietKyNhanCompleteResDTO)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thuVienAnh', maxCount: 10 }
    ], CloudinaryImageUploadConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
        summary: 'Tạo hoặc cập nhật chi tiết kỳ nhân (Upsert)',
        description: 'Nếu chưa tồn tại ChiTietKyNhan cho kyNhanId → Tạo mới. Nếu đã tồn tại → Cập nhật.'
    })
    @ApiResponse({
        status: 201,
        description: 'Tạo hoặc cập nhật chi tiết kỳ nhân thành công',
        type: CreateChiTietKyNhanCompleteResDTO
    })
    upsertFull(
        @Body() body: any,
        @UploadedFiles() files: {
            thuVienAnh?: Express.Multer.File[]
        },
        @ActiveUser('userId') userId: number
    ) {
        console.log('=== CONTROLLER UPSERT FULL ===')
        console.log('Files received:', files?.thuVienAnh?.length || 0)
        console.log('Body keys:', body ? Object.keys(body) : [])

        // Parse form data với Zod validation (giống createFull)
        const rawData = {
            kyNhanId: body.kyNhanId ? body.kyNhanId.toString().trim() : '',
            thamKhao: body.thamKhao || null,
            boiCanhLichSuVaXuatThan: this.parseFormDataArrays(body, 'boiCanhLichSuVaXuatThan'),
            suSachVietGi: this.parseFormDataArrays(body, 'suSachVietGi'),
            giaiThoaiDanGian: this.parseFormDataArrays(body, 'giaiThoaiDanGian'),
            thuVienAnh: this.parseFormDataArrays(body, 'thuVienAnh')
        }

        try {
            const payload = CreateChiTietKyNhanCompleteBodySchema.parse(rawData)
            console.log('Parsed payload for upsert')

            return this.chiTietKyNhanService.upsertFull({
                data: payload,
                userId: userId,
                thuVienAnhFiles: files?.thuVienAnh || []
            })
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
            }
            throw error
        }
    }

    @Put(':chiTietKyNhanId/full')
    @ZodSerializerDto(UpdateChiTietKyNhanCompleteResDTO)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thuVienAnh', maxCount: 10 }
    ], CloudinaryImageUploadConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Cập nhật chi tiết kỳ nhân hoàn chỉnh với tất cả thông tin' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật chi tiết kỳ nhân hoàn chỉnh thành công',
        type: UpdateChiTietKyNhanCompleteResDTO
    })
    updateFull(
        @Body() body: any,
        @Param() params: GetChiTietKyNhanParamsDTO,
        @UploadedFiles() files: {
            thuVienAnh?: Express.Multer.File[]
        },
        @ActiveUser('userId') userId: number
    ) {
        // Parse form data với Zod validation
        const rawData = {
            thamKhao: body.thamKhao !== undefined ? body.thamKhao : null,
            boiCanhLichSuVaXuatThan: this.parseFormDataArraysOptional(body, 'boiCanhLichSuVaXuatThan'),
            suSachVietGi: this.parseFormDataArraysOptional(body, 'suSachVietGi'),
            giaiThoaiDanGian: this.parseFormDataArraysOptional(body, 'giaiThoaiDanGian'),
            thuVienAnh: this.parseFormDataArraysOptional(body, 'thuVienAnh')
        }

        try {
            const payload = UpdateChiTietKyNhanCompleteBodySchema.parse(rawData)

            return this.chiTietKyNhanService.updateFull({
                data: payload,
                id: params.chiTietKyNhanId,
                updatedById: userId,
                thuVienAnhFiles: files?.thuVienAnh || []
            })
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
            }
            throw error
        }
    }

    @Put(':chiTietKyNhanId')
    @ZodSerializerDto(UpdateChiTietKyNhanResDTO)
    @ApiOperation({ summary: 'Cập nhật chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật chi tiết kỳ nhân thành công',
        type: UpdateChiTietKyNhanResDTO
    })
    update(
        @Body() body: UpdateChiTietKyNhanBodyDTO,
        @Param() params: GetChiTietKyNhanParamsDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.chiTietKyNhanService.update({
            data: body,
            id: params.chiTietKyNhanId,
            updatedById: userId
        })
    }

    @Delete(':chiTietKyNhanId')
    @ApiOperation({ summary: 'Xóa chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Xóa chi tiết kỳ nhân thành công',
        type: MessageResDTO
    })
    @ZodSerializerDto(MessageResDTO)
    delete(
        @Param() params: GetChiTietKyNhanParamsDTO,
        @ActiveUser('userId') userId: number
    ) {
        return this.chiTietKyNhanService.delete({
            id: params.chiTietKyNhanId,
            deletedById: userId
        })
    }
}
