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
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ChiTietKyNhanService } from './chi-tiet-kynhan.service'

@ApiTags('Chi Tiết Kỳ Nhân')
@Controller('chi-tiet-kynhan')
@ApiBearerAuth()
export class ChiTietKyNhanController {
    constructor(private readonly chiTietKyNhanService: ChiTietKyNhanService) { }

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
        { name: 'imgUrl', maxCount: 1 },
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
            imgUrl?: Express.Multer.File[],
            thuVienAnh?: Express.Multer.File[]
        },
        @ActiveUser('userId') userId: number
    ) {
        // Parse form data
        const payload: CreateChiTietKyNhanCompleteBodyDTO = {
            kyNhanId: body.kyNhanId || '',
            ten: body.ten || '',
            tinhCach: body.tinhCach || '',
            quanHe: body.quanHe || null,
            trichDoan: body.trichDoan || '',
            thamKhao: body.thamKhao || null,
            boiCanhLichSuVaXuatThan: body.boiCanhLichSuVaXuatThan ? JSON.parse(body.boiCanhLichSuVaXuatThan) : [],
            suSachVietGi: body.suSachVietGi ? JSON.parse(body.suSachVietGi) : [],
            giaiThoaiDanGian: body.giaiThoaiDanGian ? JSON.parse(body.giaiThoaiDanGian) : [],
            thuVienAnh: body.thuVienAnh ? JSON.parse(body.thuVienAnh) : []
        }

        return this.chiTietKyNhanService.createFull({
            data: payload,
            createdById: userId,
            imgFile: files.imgUrl?.[0],
            thuVienAnhFiles: files.thuVienAnh || []
        })
    }

    @Put(':chiTietKyNhanId/full')
    @ZodSerializerDto(UpdateChiTietKyNhanCompleteResDTO)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'imgUrl', maxCount: 1 },
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
            imgUrl?: Express.Multer.File[],
            thuVienAnh?: Express.Multer.File[]
        },
        @ActiveUser('userId') userId: number
    ) {
        // Parse form data
        const payload: UpdateChiTietKyNhanCompleteBodyDTO = {
            ten: body.ten || undefined,
            tinhCach: body.tinhCach || undefined,
            quanHe: body.quanHe !== undefined ? body.quanHe : null,
            trichDoan: body.trichDoan || undefined,
            thamKhao: body.thamKhao !== undefined ? body.thamKhao : null,
            boiCanhLichSuVaXuatThan: body.boiCanhLichSuVaXuatThan ? JSON.parse(body.boiCanhLichSuVaXuatThan) : undefined,
            suSachVietGi: body.suSachVietGi ? JSON.parse(body.suSachVietGi) : undefined,
            giaiThoaiDanGian: body.giaiThoaiDanGian ? JSON.parse(body.giaiThoaiDanGian) : undefined,
            thuVienAnh: body.thuVienAnh ? JSON.parse(body.thuVienAnh) : undefined
        }

        return this.chiTietKyNhanService.updateFull({
            data: payload,
            id: params.chiTietKyNhanId,
            updatedById: userId,
            imgFile: files.imgUrl?.[0],
            thuVienAnhFiles: files.thuVienAnh || []
        })
    }

    @Put(':chiTietKyNhanId')
    @ZodSerializerDto(UpdateChiTietKyNhanResDTO)
    @UseInterceptors(FileInterceptor('imgUrl', CloudinaryImageUploadConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Cập nhật chi tiết kỳ nhân' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật chi tiết kỳ nhân thành công',
        type: UpdateChiTietKyNhanResDTO
    })
    update(
        @Body() body: any,
        @Param() params: GetChiTietKyNhanParamsDTO,
        @UploadedFile() imgFile: Express.Multer.File,
        @ActiveUser('userId') userId: number
    ) {
        // Parse multipart form data và convert types
        const payload: UpdateChiTietKyNhanBodyDTO = {}
        if (body.ten !== undefined) payload.ten = body.ten
        if (body.tinhCach !== undefined) payload.tinhCach = body.tinhCach
        if (body.quanHe !== undefined) payload.quanHe = body.quanHe
        if (body.trichDoan !== undefined) payload.trichDoan = body.trichDoan
        if (body.thamKhao !== undefined) payload.thamKhao = body.thamKhao
        if (body.imgUrl !== undefined && !imgFile) payload.imgUrl = body.imgUrl

        return this.chiTietKyNhanService.update({
            data: payload,
            id: params.chiTietKyNhanId,
            updatedById: userId,
            imgFile
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
