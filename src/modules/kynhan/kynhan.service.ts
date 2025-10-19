import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
import { KynhanAlreadyExistsException } from './dto/kynhan.error'
import { CreateKyNhanBodyType, CreateKyNhanCompleteBodyType, UpdateKyNhanBodyType } from './entities/kynhan.entities'
import { KynhanRepo } from './kynhan.repo'
import { ChiTietKyNhanRepo } from '../chi-tiet-kynhan/chi-tiet-kynhan.repo'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo } from '../chi-tiet-kynhan/boi-canh-lich-su-va-xuat-than/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.repo'
import { ChiTietKyNhanSuSachVietGiRepo } from '../chi-tiet-kynhan/su-sach-viet-gi/chi-tiet-kynhan-su-sach-viet-gi.repo'
import { ChiTietKyNhanGiaiThoaiDanGianRepo } from '../chi-tiet-kynhan/giai-thoai-dan-gian/chi-tiet-kynhan-giai-thoai-dan-gian.repo'
import { MediaRepository } from '../media/media.repo'

@Injectable()
export class KynhanService {
  constructor(
    private kynhanRepo: KynhanRepo,
    private readonly uploadService: UploadService,
    private readonly prismaService: PrismaService,
    private readonly chiTietKyNhanRepo: ChiTietKyNhanRepo,
    private readonly boiCanhLichSuVaSuuThanRepo: ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo,
    private readonly suSachVietGiRepo: ChiTietKyNhanSuSachVietGiRepo,
    private readonly giaiThoaiDanGianRepo: ChiTietKyNhanGiaiThoaiDanGianRepo,
    private readonly mediaRepo: MediaRepository
  ) { }

  async list(pagination: PaginationQueryType) {
    const data = await this.kynhanRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async getListByUser(userId: number) {
    const data = await this.kynhanRepo.getListByUser(userId)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const attendenceConfig = await this.kynhanRepo.findById(id)
    if (!attendenceConfig) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: attendenceConfig,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({
    data,
    createdById,
    imgFile
  }: {
    data: CreateKyNhanBodyType
    createdById: number
    imgFile: Express.Multer.File
  }) {
    try {
      const isDupplicateName = data.name
        ? await this.kynhanRepo.findExistByName(data.name)
        : null
      if (isDupplicateName) {
        throw KynhanAlreadyExistsException
      }
      if (imgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'kynhan',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }
        } catch (uploadError) {
          throw uploadError
        }
      } else {
        throw new UnprocessableEntityException([
          { path: 'imgUrl', message: 'Thiếu ảnh hoặc ảnh không hợp lệ' }
        ])
      }

      if (data.imgUrl === '') {
      }

      const attendenceConfig = await this.kynhanRepo.create({
        createdById,
        data
      })

      return {
        statusCode: HttpStatus.CREATED,
        data: attendenceConfig,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw KynhanAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async createComplete({
    data,
    createdById,
    imgFile,
    chiTietImgFile,
    thuVienAnhFiles
  }: {
    data: CreateKyNhanCompleteBodyType
    createdById: number
    imgFile?: Express.Multer.File
    chiTietImgFile?: Express.Multer.File
    thuVienAnhFiles?: Express.Multer.File[]
  }) {
    // Upload ảnh trước để lấy URL, nhưng sẽ cleanup nếu transaction fail
    let imgUrl = ''
    let uploadedImgUrl = ''
    let chiTietImgUrl = ''
    let uploadedChiTietImgUrl = ''
    const uploadedThuVienAnhUrls: string[] = []
    const uploadedThuVienAnhFiles: { url: string; file: Express.Multer.File }[] = []
    let uploadErrors: string[] = []

    try {
      // Kiểm tra tên kỳ nhân đã tồn tại chưa
      const isDuplicateName = data.name
        ? await this.kynhanRepo.findExistByName(data.name)
        : null
      if (isDuplicateName) {
        throw KynhanAlreadyExistsException
      }

      // Upload ảnh trước transaction
      if (imgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'kynhan',
            'images'
          )
          imgUrl = uploadRes.url
          uploadedImgUrl = uploadRes.url // Lưu để cleanup sau
        } catch (uploadError) {
          throw uploadError
        }
      }

      // Upload ảnh cho ChiTietKyNhan
      if (chiTietImgFile) {
        try {
          const uploadRes = await this.uploadService.uploadFileByType(
            chiTietImgFile,
            'chi-tiet-kynhan',
            'images'
          )
          chiTietImgUrl = uploadRes.url
          uploadedChiTietImgUrl = uploadRes.url // Lưu để cleanup sau
        } catch (uploadError) {
          throw uploadError
        }
      }

      // Upload multiple ảnh cho thư viện media với error handling tốt hơn
      if (thuVienAnhFiles && thuVienAnhFiles.length > 0) {
        uploadErrors = [] // Reset errors array

        for (let i = 0; i < thuVienAnhFiles.length; i++) {
          const file = thuVienAnhFiles[i]

          // Basic file validation
          if (!file || !file.originalname || !file.buffer) {
            const errorMsg = `Invalid file at index ${i}: missing file data`
            uploadErrors.push(errorMsg)
            console.error(errorMsg)
            continue
          }

          // Check file size (15MB limit)
          const maxSize = 15 * 1024 * 1024 // 15MB
          if (file.size && file.size > maxSize) {
            const errorMsg = `File ${file.originalname} is too large (${Math.round(file.size / 1024 / 1024)}MB, max 15MB)`
            uploadErrors.push(errorMsg)
            console.error(errorMsg)
            continue
          }

          // Check file type
          if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            const errorMsg = `File ${file.originalname} is not an image (${file.mimetype})`
            uploadErrors.push(errorMsg)
            console.error(errorMsg)
            continue
          }

          try {
            const uploadRes = await this.uploadService.uploadFileByType(
              file,
              'chi-tiet-kynhan',
              'thu-vien-anh'
            )
            uploadedThuVienAnhUrls.push(uploadRes.url)
            uploadedThuVienAnhFiles.push({ url: uploadRes.url, file })
          } catch (uploadError) {
            // Log lỗi cho từng file nhưng tiếp tục với files khác
            const errorMsg = `Failed to upload file ${file.originalname}: ${uploadError.message}`
            uploadErrors.push(errorMsg)
            console.error(errorMsg)
          }
        }

        // Log và xử lý upload errors
        if (uploadErrors.length > 0) {
          console.warn(`Upload completed with ${uploadErrors.length} errors:`, uploadErrors)

          // Nếu tất cả files đều upload thất bại, có thể throw error hoặc warning
          if (uploadErrors.length === thuVienAnhFiles.length) {
            console.warn('All library image uploads failed, but continuing with other data...')
            // Chúng ta vẫn tiếp tục để tạo kỳ nhân với data khác
          }
        }
      }

      // Sử dụng transaction để tạo tất cả dữ liệu
      const result = await this.prismaService.$transaction(async (tx) => {
        // 1. Tạo KyNhan
        const kyNhan = await tx.kyNhan.create({
          data: {
            name: data.name,
            thoiKy: data.thoiKy,
            chienCong: data.chienCong,
            landId: data.landId,
            imgUrl,
            active: data.active,
            createdById
          }
        })

        // 2. Tạo ChiTietKyNhan
        const chiTietKyNhan = await tx.chiTietKyNhan.create({
          data: {
            kyNhanId: kyNhan.id,
            ten: data.chiTietKyNhan.ten,
            tinhCach: data.chiTietKyNhan.tinhCach,
            quanHe: data.chiTietKyNhan.quanHe,
            trichDoan: data.chiTietKyNhan.trichDoan,
            thamKhao: data.chiTietKyNhan.thamKhao || null,
            imgUrl: chiTietImgUrl || data.chiTietKyNhan.imgUrl || null,
            createdById
          }
        })

        // 3. Tạo Bối cảnh lịch sử và xuất thân
        if (data.chiTietKyNhan.boiCanhLichSuVaXuatThan && data.chiTietKyNhan.boiCanhLichSuVaXuatThan.length > 0) {
          for (let index = 0; index < data.chiTietKyNhan.boiCanhLichSuVaXuatThan.length; index++) {
            const item = data.chiTietKyNhan.boiCanhLichSuVaXuatThan[index]
            await tx.chiTietKyNhanBoiCanhLichSuVaSuuThan.create({
              data: {
                chiTietKyNhanId: chiTietKyNhan.id,
                tieuDe: item.tieuDe,
                noiDung: item.noiDung,
                nguon: item.nguon,
                thuTu: index + 1,
                createdById
              }
            })
          }
        }

        // 4. Tạo Sử sách viết gì
        if (data.chiTietKyNhan.suSachVietGi && data.chiTietKyNhan.suSachVietGi.length > 0) {
          for (const item of data.chiTietKyNhan.suSachVietGi) {
            await tx.chiTietKyNhanSuSachVietGi.create({
              data: {
                chiTietKyNhanId: chiTietKyNhan.id,
                tieuDe: item.tieuDe,
                doanVan: item.doanVan,
                tacGia: item.tacGia,
                nguonSach: item.nguonSach,
                createdById
              }
            })
          }
        }

        // 5. Tạo Giai thoại dân gian và truyền thuyết
        if (data.chiTietKyNhan.giaiThoaiDanGian && data.chiTietKyNhan.giaiThoaiDanGian.length > 0) {
          for (const item of data.chiTietKyNhan.giaiThoaiDanGian) {
            await tx.chiTietKyNhanGiaiThoaiDanGian.create({
              data: {
                chiTietKyNhanId: chiTietKyNhan.id,
                tieuDe: item.tieuDe,
                noiDung: item.noiDung,
                nguon: item.nguon,
                createdById
              }
            })
          }
        }

        // 6. Tạo Media (thư viện ảnh)
        // Ưu tiên sử dụng files đã upload, fallback về data từ form
        if (uploadedThuVienAnhFiles.length > 0) {
          // Tạo từ uploaded files
          for (let index = 0; index < uploadedThuVienAnhFiles.length; index++) {
            const item = uploadedThuVienAnhFiles[index]
            await tx.media.create({
              data: {
                chiTietId: chiTietKyNhan.id,
                type: 'IMAGE',
                url: item.url,
                fileName: item.file.originalname,
                fileSize: item.file.size,
                mimeType: item.file.mimetype,
                thuTu: index + 1,
                createdById
              }
            })
          }
        } else if (data.chiTietKyNhan.thuVienAnh && data.chiTietKyNhan.thuVienAnh.length > 0) {
          // Fallback về data từ form
          for (let index = 0; index < data.chiTietKyNhan.thuVienAnh.length; index++) {
            const item = data.chiTietKyNhan.thuVienAnh[index]
            await tx.media.create({
              data: {
                chiTietId: chiTietKyNhan.id,
                type: 'IMAGE',
                url: item.url,
                fileName: item.fileName,
                fileSize: item.fileSize,
                mimeType: item.mimeType,
                thuTu: index + 1,
                createdById
              }
            })
          }
        }

        // Trả về kỳ nhân với chi tiết
        return await tx.kyNhan.findUnique({
          where: { id: kyNhan.id },
          include: {
            chiTietKyNhans: {
              where: { deletedAt: null },
              include: {
                boiCanhLichSuVaSuuThan: {
                  where: { deletedAt: null },
                  orderBy: { thuTu: 'asc' }
                },
                suSachVietGi: {
                  where: { deletedAt: null },
                  orderBy: { thuTu: 'asc' }
                },
                giaiThoaiDanGian: {
                  where: { deletedAt: null },
                  orderBy: { thuTu: 'asc' }
                },
                media: {
                  where: { deletedAt: null },
                  orderBy: { thuTu: 'asc' }
                }
              }
            }
          }
        })
      })

      // Tạo message với thông tin về upload errors nếu có
      let message = 'Tạo kỳ nhân hoàn chỉnh thành công'
      if (uploadErrors.length > 0) {
        message += ` (${uploadErrors.length} file upload thất bại: ${uploadErrors.join(', ')})`
      }

      return {
        statusCode: HttpStatus.CREATED,
        data: result,
        message,
        uploadWarnings: uploadErrors.length > 0 ? uploadErrors : undefined
      }
    } catch (error) {
      // Cleanup uploaded images nếu transaction fail
      if (uploadedImgUrl && imgFile) {
        try {
          await this.uploadService.deleteFile(uploadedImgUrl, 'kynhan/images')
        } catch (cleanupError) {
          // Log cleanup error nhưng không throw để không che giấu original error
          console.error('Failed to cleanup uploaded kyNhan image:', cleanupError)
        }
      }

      if (uploadedChiTietImgUrl && chiTietImgFile) {
        try {
          await this.uploadService.deleteFile(uploadedChiTietImgUrl, 'chi-tiet-kynhan/images')
        } catch (cleanupError) {
          // Log cleanup error nhưng không throw để không che giấu original error
          console.error('Failed to cleanup uploaded chiTietKyNhan image:', cleanupError)
        }
      }

      // Cleanup uploaded thu vien anh files
      if (uploadedThuVienAnhUrls.length > 0) {
        for (const url of uploadedThuVienAnhUrls) {
          try {
            await this.uploadService.deleteFile(url, 'chi-tiet-kynhan/thu-vien-anh')
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded thuVienAnh image:', url, cleanupError)
          }
        }
      }

      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw KynhanAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
    imgFile
  }: {
    id: number
    data: UpdateKyNhanBodyType
    updatedById: number
    imgFile?: Express.Multer.File
  }) {
    try {
      const existing = await this.kynhanRepo.findById(id)
      if (!existing) {
        throw NotFoundRecordException
      }

      const isDupplicateName = data.name
        ? await this.kynhanRepo.findExistByName(data.name)
        : null
      if (isDupplicateName && isDupplicateName.id !== id) {
        throw KynhanAlreadyExistsException
      }
      if (imgFile) {
        try {
          // Upload new image into god-profiles/images
          const uploadRes = await this.uploadService.uploadFileByType(
            imgFile,
            'kynhan',
            'images'
          )
          data = { ...data, imgUrl: uploadRes.url }

          // Try to delete old image if existed
          if (existing.imgUrl) {
            try {
              await this.uploadService.deleteFile(existing.imgUrl, 'kynhan/images')
            } catch (delErr) { }
          }
        } catch (uploadError) {
          throw uploadError
        }
      }

      const updatedKynhan = await this.kynhanRepo.update({
        id,
        updatedById,
        data
      })
      return {
        statusCode: HttpStatus.OK,
        data: updatedKynhan,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw KynhanAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.kynhanRepo.delete({
        id,
        deletedById
      })
      return {
        statusCode: HttpStatus.OK,
        data: null,
        message: ENTITY_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw KynhanAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
