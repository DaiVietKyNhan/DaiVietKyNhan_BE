import { IsPublic } from '@/common/decorators/auth.decorator'
import { MulterExceptionFilter } from '@/shared/filters/multer-exception.filter'
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CloudinaryFlexibleUploadConfig,
  CloudinaryImageUploadConfig
} from './cloudinary/multer.config'
import {
  GenerateUploadUrlBodyDTO,
  GenerateUploadUrlResponseDTO,
  GenerateUploadUrlSwaggerDTO
} from './dto/upload-presigned.dto'
import {
  UploadFileBodyDTO,
  UploadFileResponseDTO,
  UploadFileSwaggerDTO,
  UploadImageFlexibleResponseDTO
} from './dto/upload-zod.dto'
import { UploadImageDTO, UploadImageResponseDTO } from './dto/upload.dto'
import { UploadResult, UploadService } from './upload.service'

@Controller('upload')
@ApiBearerAuth('access-token')
@ApiBearerAuth()
@UseFilters(MulterExceptionFilter)
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('generate-upload-url')
  @IsPublic()
  @ZodSerializerDto(GenerateUploadUrlResponseDTO)
  @ApiOperation({ summary: 'Tạo pre-signed URL để upload file trực tiếp lên Cloudinary' })
  @ApiBody({ type: GenerateUploadUrlSwaggerDTO })
  @ApiResponse({
    status: 201,
    description: 'Tạo upload URL thành công',
    type: GenerateUploadUrlResponseDTO
  })
  @ApiResponse({
    status: 400,
    description: 'Thông tin file không hợp lệ',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'File type "image" không khớp với MIME type "audio/mp3"'
        },
        error: { type: 'string', example: 'Bad Request' },
        timestamp: { type: 'string', example: '2025-10-05T10:30:00.000Z' }
      }
    }
  })
  async generateUploadUrl(
    @Body() body: GenerateUploadUrlBodyDTO
  ): Promise<GenerateUploadUrlResponseDTO> {
    try {
      const result = await this.uploadService.generateUploadUrl(body)

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo upload URL thành công!',
        data: result
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      console.error('Generate upload URL error:', error)
      throw new BadRequestException('Đã xảy ra lỗi khi tạo upload URL. Vui lòng thử lại.')
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file chung' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Upload thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        url: { type: 'string' },
        publicId: { type: 'string' }
      }
    }
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadService.uploadFile(file, 'uploads')
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image', CloudinaryImageUploadConfig))
  @ApiOperation({ summary: 'Upload hình ảnh với folder tùy chọn - API tái sử dụng cho toàn hệ thống' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDTO })
  @ApiResponse({
    status: 201,
    description: 'Upload hình ảnh thành công',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Upload hình ảnh thành công!' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://res.cloudinary.com/...' },
            publicId: { type: 'string', example: 'folderName/images/filename' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc vượt quá giới hạn kích thước (15MB)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Chỉ chấp nhận file hình ảnh (JPEG, PNG, WEBP, GIF)'
        },
        error: { type: 'string', example: 'Bad Request' },
        timestamp: { type: 'string', example: '2025-10-05T10:30:00.000Z' }
      }
    }
  })
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
    @Body('folderName') folderName: string
  ) {
    try {
      // Validate required fields
      if (!image) {
        throw new BadRequestException('Vui lòng chọn file hình ảnh để upload')
      }

      if (!folderName) {
        throw new BadRequestException('Vui lòng cung cấp tên folder')
      }

      // Validate folder name format
      const folderNameRegex = /^[a-zA-Z0-9_-]+$/
      if (!folderNameRegex.test(folderName)) {
        throw new BadRequestException('Tên folder chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới')
      }

      const result = await this.uploadService.uploadImageFile(image, folderName)

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Upload hình ảnh thành công!',
        data: {
          url: result.url,
          publicId: result.publicId
        }
      }
    } catch (error) {
      // Re-throw BadRequestException as is
      if (error instanceof BadRequestException) {
        throw error
      }

      // Handle other service errors
      console.error('Upload service error:', error)
      throw new BadRequestException('Đã xảy ra lỗi khi upload file. Vui lòng thử lại.')
    }
  }

  @Post('image/flexible')
  @UseInterceptors(FileInterceptor('image', CloudinaryImageUploadConfig))
  @ZodSerializerDto(UploadImageFlexibleResponseDTO)
  @ApiOperation({ summary: 'Upload hình ảnh linh hoạt với tùy chọn đa dạng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh (JPEG, PNG, WEBP, GIF). Tối đa 15MB'
        },
        folderName: {
          type: 'string',
          example: 'avatars',
          description: 'Tên folder (user, avatar, product, etc.)'
        },
        subFolder: {
          type: 'string',
          example: 'thumbnails',
          description: 'Tên subfolder tùy chọn (optional)'
        },
        customPath: {
          type: 'string',
          example: 'custom/path',
          description: 'Đường dẫn tùy chỉnh thay thế folderName/subFolder (optional)'
        }
      },
      required: ['image', 'folderName']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Upload hình ảnh thành công',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Upload hình ảnh thành công!' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://res.cloudinary.com/...' },
            publicId: { type: 'string', example: 'folderName/images/filename' },
            folder: { type: 'string', example: 'folderName/images' }
          }
        }
      }
    }
  })
  async uploadImageFlexible(
    @UploadedFile() image: Express.Multer.File,
    @Body('folderName') folderName: string,
    @Body('subFolder') subFolder?: string,
    @Body('customPath') customPath?: string
  ) {
    try {
      // Validate required fields
      if (!image) {
        throw new BadRequestException('Vui lòng chọn file hình ảnh để upload')
      }

      if (!folderName) {
        throw new BadRequestException('Vui lòng cung cấp tên folder')
      }

      // Validate folder name format
      const nameRegex = /^[a-zA-Z0-9_-]+$/
      const customPathRegex = /^[a-zA-Z0-9_/-]+$/

      if (!nameRegex.test(folderName)) {
        throw new BadRequestException('Tên folder chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới')
      }

      if (subFolder && !nameRegex.test(subFolder)) {
        throw new BadRequestException('Tên subfolder chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới')
      }

      // Determine upload path
      let uploadPath: string
      if (customPath) {
        if (!customPathRegex.test(customPath)) {
          throw new BadRequestException('Custom path chỉ được chứa chữ cái, số, dấu gạch ngang, gạch dưới và dấu /')
        }
        uploadPath = customPath
      } else {
        uploadPath = subFolder ? `${folderName}/${subFolder}` : folderName
      }

      // Upload with custom path structure
      const result = await this.uploadService.uploadFileByType(image, uploadPath, 'images')

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Upload hình ảnh thành công!',
        data: {
          url: result.url,
          publicId: result.publicId,
          folder: `${uploadPath}/images`
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      console.error('Upload service error:', error)
      throw new BadRequestException('Đã xảy ra lỗi khi upload file. Vui lòng thử lại.')
    }
  }

  @Post('file')
  @IsPublic()
  @UseInterceptors(FileInterceptor('file', CloudinaryFlexibleUploadConfig))
  @ZodSerializerDto(UploadFileResponseDTO)
  @ApiOperation({
    summary: 'Upload file với type linh hoạt (image, audio, video, document)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileSwaggerDTO })
  @ApiResponse({
    status: 201,
    description: 'Upload file thành công',
    type: UploadFileResponseDTO
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ, type không đúng hoặc vượt quá giới hạn kích thước',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Với type "image", chỉ chấp nhận file hình ảnh (JPEG, PNG, WEBP, GIF)'
        },
        error: { type: 'string', example: 'Bad Request' },
        timestamp: { type: 'string', example: '2025-10-05T10:30:00.000Z' }
      }
    }
  })
  async uploadFileFlexible(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileBodyDTO
  ): Promise<UploadFileResponseDTO> {
    try {
      // Validate required fields
      if (!file) {
        throw new BadRequestException('Vui lòng chọn file để upload')
      }

      const { folderName, type = 'image' } = body

      // Validate file type matches expected type
      const fileTypeValidation = {
        image: (mimetype: string) => mimetype.startsWith('image/'),
        audio: (mimetype: string) => mimetype.startsWith('audio/'),
        video: (mimetype: string) => mimetype.startsWith('video/'),
        document: (mimetype: string) => {
          const documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
          ]
          return documentTypes.includes(mimetype)
        }
      }

      // Validate file type
      const isValidType = fileTypeValidation[type]?.(file.mimetype)
      if (!isValidType) {
        const typeMessages = {
          image: 'hình ảnh (JPEG, PNG, WEBP, GIF)',
          audio: 'âm thanh (MP3, WAV, OGG)',
          video: 'video (MP4, AVI, MOV)',
          document: 'tài liệu (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV)'
        }
        throw new BadRequestException(
          `Với type "${type}", chỉ chấp nhận file ${typeMessages[type]}. File hiện tại: ${file.mimetype}`
        )
      }

      // Validate file size based on type
      const fileSizeLimits = {
        image: 5 * 1024 * 1024, // 5MB
        audio: 10 * 1024 * 1024, // 10MB
        video: 50 * 1024 * 1024, // 50MB
        document: 5 * 1024 * 1024 // 5MB
      }

      const maxSize = fileSizeLimits[type] || fileSizeLimits.image
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024))
        throw new BadRequestException(
          `Kích thước file ${type} không được vượt quá ${maxSizeMB}MB`
        )
      }

      // Get appropriate upload folder based on file type
      let uploadFolder: string
      switch (type) {
        case 'image':
          uploadFolder = 'images'
          break
        case 'audio':
          uploadFolder = 'audio'
          break
        case 'video':
          uploadFolder = 'videos'
          break
        case 'document':
          uploadFolder = 'documents'
          break
        default:
          uploadFolder = 'images'
      }

      const result = await this.uploadService.uploadFileByType(
        file,
        folderName,
        uploadFolder
      )

      return {
        statusCode: HttpStatus.CREATED,
        message: `Upload ${type} thành công!`,
        data: {
          url: result.url,
          publicId: result.publicId
        }
      }
    } catch (error) {
      // Re-throw BadRequestException as is
      if (error instanceof BadRequestException) {
        throw error
      }

      // Handle other service errors
      console.error('Upload service error:', error)
      throw new BadRequestException('Đã xảy ra lỗi khi upload file. Vui lòng thử lại.')
    }
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('image', CloudinaryImageUploadConfig))
  @ApiOperation({ summary: 'Upload avatar - API đơn giản cho avatar người dùng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh avatar (JPEG, PNG, WEBP, GIF). Tối đa 15MB'
        }
      },
      required: ['image']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Upload avatar thành công',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Upload avatar thành công!' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://res.cloudinary.com/...' },
            publicId: { type: 'string', example: 'avatars/images/filename' }
          }
        }
      }
    }
  })
  async uploadAvatar(@UploadedFile() image: Express.Multer.File) {
    try {
      if (!image) {
        throw new BadRequestException('Vui lòng chọn file hình ảnh để upload')
      }

      const result = await this.uploadService.uploadImageFile(image, 'avatars')

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Upload avatar thành công!',
        data: {
          url: result.url,
          publicId: result.publicId
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      console.error('Upload avatar error:', error)
      throw new BadRequestException('Đã xảy ra lỗi khi upload avatar. Vui lòng thử lại.')
    }
  }
}
