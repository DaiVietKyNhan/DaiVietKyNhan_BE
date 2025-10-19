import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { UploadService } from '@/3rdService/upload/upload.service'
import { NotFoundRecordException } from 'src/shared/error'
import {
    isForeignKeyConstraintPrismaError,
    isNotFoundPrismaError,
    isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ChiTietKyNhanAlreadyExistsException } from './dto/chi-tiet-kynhan.error'
import { CreateChiTietKyNhanBodyType, CreateChiTietKyNhanCompleteBodyType, UpdateChiTietKyNhanBodyType, UpdateChiTietKyNhanCompleteBodyType } from './entities/chi-tiet-kynhan.entities'
import { ChiTietKyNhanRepo } from './chi-tiet-kynhan.repo'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo } from './boi-canh-lich-su-va-xuat-than/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.repo'
import { ChiTietKyNhanSuSachVietGiRepo } from './su-sach-viet-gi/chi-tiet-kynhan-su-sach-viet-gi.repo'
import { ChiTietKyNhanGiaiThoaiDanGianRepo } from './giai-thoai-dan-gian/chi-tiet-kynhan-giai-thoai-dan-gian.repo'
import { MediaRepository } from '../media/media.repo'

@Injectable()
export class ChiTietKyNhanService {
    constructor(
        private chiTietKyNhanRepo: ChiTietKyNhanRepo,
        private readonly uploadService: UploadService,
        private readonly prismaService: PrismaService,
        private readonly boiCanhLichSuVaSuuThanRepo: ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo,
        private readonly suSachVietGiRepo: ChiTietKyNhanSuSachVietGiRepo,
        private readonly giaiThoaiDanGianRepo: ChiTietKyNhanGiaiThoaiDanGianRepo,
        private readonly mediaRepository: MediaRepository
    ) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.chiTietKyNhanRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findByKyNhanId(kyNhanId: number) {
        const data = await this.chiTietKyNhanRepo.findByKyNhanId(kyNhanId)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findById(id: number) {
        const chiTietKyNhan = await this.chiTietKyNhanRepo.findById(id)
        if (!chiTietKyNhan) {
            throw NotFoundRecordException
        }
        return {
            statusCode: HttpStatus.OK,
            data: chiTietKyNhan,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async create({
        data,
        createdById,
        imgFile
    }: {
        data: CreateChiTietKyNhanBodyType
        createdById: number
        imgFile?: Express.Multer.File
    }) {
        let uploadedImgUrl: string | null = null

        try {
            // Kiểm tra xem đã có chi tiết với tên này cho kỳ nhân này chưa
            const isDuplicateName = data.ten
                ? await this.chiTietKyNhanRepo.findExistByNameAndKyNhan(data.ten, data.kyNhanId)
                : null
            if (isDuplicateName) {
                throw ChiTietKyNhanAlreadyExistsException
            }

            // Upload file nếu có
            let imgUrl = data.imgUrl

            if (imgFile) {
                try {
                    const uploadRes = await this.uploadService.uploadFileByType(
                        imgFile,
                        'chi-tiet-kynhan',
                        'images'
                    )
                    imgUrl = uploadRes.url
                    uploadedImgUrl = uploadRes.url
                } catch (uploadError) {
                    throw uploadError
                }
            }

            // Tạo data object để create, bao gồm imgUrl nếu có upload file
            const createData = { ...data }
            if (imgUrl !== undefined) {
                createData.imgUrl = imgUrl
            }

            const chiTietKyNhan = await this.chiTietKyNhanRepo.create({
                createdById,
                data: createData
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: chiTietKyNhan,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
            // Cleanup uploaded file nếu có lỗi sau khi upload
            if (uploadedImgUrl && imgFile) {
                try {
                    await this.uploadService.deleteFile(uploadedImgUrl, 'chi-tiet-kynhan/images')
                } catch (cleanupError) {
                    console.error('Failed to cleanup uploaded image after error:', cleanupError)
                }
            }

            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw ChiTietKyNhanAlreadyExistsException
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
        data: UpdateChiTietKyNhanBodyType
        updatedById: number
        imgFile?: Express.Multer.File
    }) {
        let uploadedImgUrl: string | null = null
        let oldImgUrl: string | null = null

        try {
            const existing = await this.chiTietKyNhanRepo.findById(id)
            if (!existing) {
                throw NotFoundRecordException
            }

            // Kiểm tra tên trùng lặp nếu có thay đổi tên
            if (data.ten && data.ten !== existing.ten) {
                const isDuplicateName = await this.chiTietKyNhanRepo.findExistByNameAndKyNhan(
                    data.ten,
                    data.kyNhanId || existing.kyNhanId
                )
                if (isDuplicateName && isDuplicateName.id !== id) {
                    throw ChiTietKyNhanAlreadyExistsException
                }
            }

            // Upload file nếu có
            let imgUrl = data.imgUrl

            if (imgFile) {
                try {
                    const uploadRes = await this.uploadService.uploadFileByType(
                        imgFile,
                        'chi-tiet-kynhan',
                        'images'
                    )
                    imgUrl = uploadRes.url
                    uploadedImgUrl = uploadRes.url
                    oldImgUrl = existing.imgUrl
                } catch (uploadError) {
                    throw uploadError
                }
            }

            // Tạo data object để update, bao gồm imgUrl nếu có upload file
            const updateData = { ...data }
            if (imgUrl !== undefined) {
                updateData.imgUrl = imgUrl
            }

            const updatedChiTietKyNhan = await this.chiTietKyNhanRepo.update({
                id,
                updatedById,
                data: updateData
            })

            // Cleanup file cũ nếu upload thành công
            if (oldImgUrl && oldImgUrl !== imgUrl) {
                try {
                    await this.uploadService.deleteFile(oldImgUrl, 'chi-tiet-kynhan/images')
                } catch (cleanupError) {
                    console.error('Failed to cleanup old image:', cleanupError)
                }
            }

            return {
                statusCode: HttpStatus.OK,
                data: updatedChiTietKyNhan,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            // Cleanup uploaded file nếu có lỗi sau khi upload
            if (uploadedImgUrl && imgFile) {
                try {
                    await this.uploadService.deleteFile(uploadedImgUrl, 'chi-tiet-kynhan/images')
                } catch (cleanupError) {
                    console.error('Failed to cleanup uploaded image after error:', cleanupError)
                }
            }
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw ChiTietKyNhanAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }

    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.chiTietKyNhanRepo.delete({
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
            throw error
        }
    }

    async createFull({
        data,
        createdById,
        imgFile,
        thuVienAnhFiles
    }: {
        data: CreateChiTietKyNhanCompleteBodyType
        createdById: number
        imgFile?: Express.Multer.File
        thuVienAnhFiles?: Express.Multer.File[]
    }) {
        let uploadedImgUrl: string | null = null
        const uploadedThuVienAnhFiles: Array<{ url: string; file: Express.Multer.File }> = []
        const uploadWarnings: Array<{ fileName: string; error: string }> = []

        try {
            // Kiểm tra xem đã có chi tiết với tên này cho kỳ nhân này chưa
            const isDuplicateName = data.ten
                ? await this.chiTietKyNhanRepo.findExistByNameAndKyNhan(data.ten, data.kyNhanId)
                : null
            if (isDuplicateName) {
                throw ChiTietKyNhanAlreadyExistsException
            }

            // Upload ảnh chính của chi tiết kỳ nhân nếu có
            if (imgFile) {
                try {
                    const uploadRes = await this.uploadService.uploadFileByType(
                        imgFile,
                        'chi-tiet-kynhan',
                        'images'
                    )
                    uploadedImgUrl = uploadRes.url
                } catch (uploadError) {
                    throw uploadError
                }
            }

            // Upload thư viện ảnh nếu có
            if (thuVienAnhFiles && thuVienAnhFiles.length > 0) {
                for (const file of thuVienAnhFiles) {
                    try {
                        if (!file || !file.buffer || file.size === 0) {
                            uploadWarnings.push({
                                fileName: file?.originalname || 'unknown',
                                error: 'Missing file data or empty file'
                            })
                            continue
                        }

                        if (file.size > 10 * 1024 * 1024) { // 10MB limit
                            uploadWarnings.push({
                                fileName: file.originalname,
                                error: 'File size exceeds 10MB limit'
                            })
                            continue
                        }

                        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
                            uploadWarnings.push({
                                fileName: file.originalname,
                                error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
                            })
                            continue
                        }

                        const uploadRes = await this.uploadService.uploadFileByType(
                            file,
                            'chi-tiet-kynhan',
                            'media'
                        )
                        uploadedThuVienAnhFiles.push({ url: uploadRes.url, file })
                    } catch (uploadError) {
                        uploadWarnings.push({
                            fileName: file.originalname,
                            error: `Upload failed: ${uploadError.message}`
                        })
                    }
                }
            }

            // Tạo transaction để tạo tất cả records
            const result = await this.prismaService.$transaction(async (tx) => {
                // 1. Tạo ChiTietKyNhan
                const chiTietKyNhan = await tx.chiTietKyNhan.create({
                    data: {
                        kyNhanId: data.kyNhanId,
                        ten: data.ten,
                        tinhCach: data.tinhCach,
                        quanHe: data.quanHe,
                        trichDoan: data.trichDoan,
                        thamKhao: data.thamKhao,
                        imgUrl: uploadedImgUrl || null,
                        createdById
                    }
                })

                // 2. Tạo Bối cảnh lịch sử và xuất thân
                if (data.boiCanhLichSuVaXuatThan && data.boiCanhLichSuVaXuatThan.length > 0) {
                    for (let index = 0; index < data.boiCanhLichSuVaXuatThan.length; index++) {
                        const item = data.boiCanhLichSuVaXuatThan[index]
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

                // 3. Tạo Sử sách viết gì
                if (data.suSachVietGi && data.suSachVietGi.length > 0) {
                    for (const item of data.suSachVietGi) {
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

                // 4. Tạo Giai thoại dân gian và truyền thuyết
                if (data.giaiThoaiDanGian && data.giaiThoaiDanGian.length > 0) {
                    for (const item of data.giaiThoaiDanGian) {
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

                // 5. Tạo Media (thư viện ảnh)
                if (uploadedThuVienAnhFiles.length > 0) {
                    for (let index = 0; index < uploadedThuVienAnhFiles.length; index++) {
                        const { url, file } = uploadedThuVienAnhFiles[index]
                        await tx.media.create({
                            data: {
                                chiTietId: chiTietKyNhan.id,
                                type: 'IMAGE',
                                url: url,
                                fileName: file.originalname,
                                fileSize: file.size,
                                mimeType: file.mimetype,
                                thuTu: index + 1,
                                createdById
                            }
                        })
                    }
                } else if (data.thuVienAnh && data.thuVienAnh.length > 0) {
                    for (let index = 0; index < data.thuVienAnh.length; index++) {
                        const item = data.thuVienAnh[index]
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

                return chiTietKyNhan
            })

            // Fetch lại với đầy đủ relations
            const chiTietKyNhanWithRelations = await this.chiTietKyNhanRepo.findById(result.id)

            return {
                statusCode: HttpStatus.CREATED,
                data: chiTietKyNhanWithRelations,
                message: ENTITY_MESSAGE.CREATE_SUCCESS,
                uploadWarnings: uploadWarnings.length > 0 ? uploadWarnings : undefined
            }

        } catch (error) {
            // Cleanup uploaded files nếu có lỗi
            const filesToCleanup = [
                ...(uploadedImgUrl ? [uploadedImgUrl] : []),
                ...uploadedThuVienAnhFiles.map(item => item.url)
            ]

            for (const url of filesToCleanup) {
                try {
                    await this.uploadService.deleteFile(url, 'chi-tiet-kynhan/images')
                } catch (cleanupError) {
                    console.error('Failed to cleanup uploaded file:', cleanupError)
                }
            }

            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw ChiTietKyNhanAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }

    async updateFull({
        data,
        id,
        updatedById,
        imgFile,
        thuVienAnhFiles
    }: {
        data: UpdateChiTietKyNhanCompleteBodyType
        id: number
        updatedById: number
        imgFile?: Express.Multer.File
        thuVienAnhFiles?: Express.Multer.File[]
    }) {
        let uploadedImgUrl: string | null = null
        let oldImgUrl: string | null = null
        const uploadedThuVienAnhFiles: Array<{ url: string; file: Express.Multer.File }> = []
        const uploadWarnings: Array<{ fileName: string; error: string }> = []

        try {
            // Kiểm tra chi tiết kỳ nhân tồn tại
            const existing = await this.chiTietKyNhanRepo.findById(id)
            if (!existing) {
                throw NotFoundRecordException
            }

            // Kiểm tra tên trùng lặp nếu có thay đổi tên
            if (data.ten && data.ten !== existing.ten) {
                const isDuplicateName = await this.chiTietKyNhanRepo.findExistByNameAndKyNhan(
                    data.ten,
                    existing.kyNhanId
                )
                if (isDuplicateName && isDuplicateName.id !== id) {
                    throw ChiTietKyNhanAlreadyExistsException
                }
            }

            // Upload ảnh chính của chi tiết kỳ nhân nếu có
            if (imgFile) {
                try {
                    const uploadRes = await this.uploadService.uploadFileByType(
                        imgFile,
                        'chi-tiet-kynhan',
                        'images'
                    )
                    uploadedImgUrl = uploadRes.url
                    oldImgUrl = existing.imgUrl // Lưu URL cũ để cleanup sau
                } catch (uploadError) {
                    throw uploadError
                }
            }

            // Upload thư viện ảnh mới nếu có
            if (thuVienAnhFiles && thuVienAnhFiles.length > 0) {
                for (const file of thuVienAnhFiles) {
                    try {
                        if (!file || !file.buffer || file.size === 0) {
                            uploadWarnings.push({
                                fileName: file?.originalname || 'unknown',
                                error: 'Missing file data or empty file'
                            })
                            continue
                        }

                        if (file.size > 10 * 1024 * 1024) { // 10MB limit
                            uploadWarnings.push({
                                fileName: file.originalname,
                                error: 'File size exceeds 10MB limit'
                            })
                            continue
                        }

                        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
                            uploadWarnings.push({
                                fileName: file.originalname,
                                error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
                            })
                            continue
                        }

                        const uploadRes = await this.uploadService.uploadFileByType(
                            file,
                            'chi-tiet-kynhan',
                            'media'
                        )
                        uploadedThuVienAnhFiles.push({ url: uploadRes.url, file })
                    } catch (uploadError) {
                        uploadWarnings.push({
                            fileName: file.originalname,
                            error: `Upload failed: ${uploadError.message}`
                        })
                    }
                }
            }

            // Tạo transaction để update tất cả records
            const result = await this.prismaService.$transaction(async (tx) => {
                // 1. Update ChiTietKyNhan
                const updateData: any = {
                    updatedById
                }
                if (data.ten !== undefined) updateData.ten = data.ten
                if (data.tinhCach !== undefined) updateData.tinhCach = data.tinhCach
                if (data.quanHe !== undefined) updateData.quanHe = data.quanHe
                if (data.trichDoan !== undefined) updateData.trichDoan = data.trichDoan
                if (data.thamKhao !== undefined) updateData.thamKhao = data.thamKhao
                if (uploadedImgUrl !== null) updateData.imgUrl = uploadedImgUrl

                const chiTietKyNhan = await tx.chiTietKyNhan.update({
                    where: { id },
                    data: updateData
                })

                // 2. Update/Create/Delete Bối cảnh lịch sử và xuất thân
                if (data.boiCanhLichSuVaXuatThan !== undefined) {
                    // Xóa tất cả để tạo lại (có thể optimize để update theo ID nếu cần)
                    await tx.chiTietKyNhanBoiCanhLichSuVaSuuThan.deleteMany({
                        where: { chiTietKyNhanId: id }
                    })

                    // Tạo mới từ data
                    for (let index = 0; index < data.boiCanhLichSuVaXuatThan.length; index++) {
                        const item = data.boiCanhLichSuVaXuatThan[index]
                        await tx.chiTietKyNhanBoiCanhLichSuVaSuuThan.create({
                            data: {
                                chiTietKyNhanId: id,
                                tieuDe: item.tieuDe,
                                noiDung: item.noiDung,
                                nguon: item.nguon,
                                thuTu: index + 1,
                                createdById: updatedById
                            }
                        })
                    }
                }

                // 3. Update/Create/Delete Sử sách viết gì
                if (data.suSachVietGi !== undefined) {
                    // Xóa tất cả để tạo lại
                    await tx.chiTietKyNhanSuSachVietGi.deleteMany({
                        where: { chiTietKyNhanId: id }
                    })

                    // Tạo mới từ data
                    for (const item of data.suSachVietGi) {
                        await tx.chiTietKyNhanSuSachVietGi.create({
                            data: {
                                chiTietKyNhanId: id,
                                tieuDe: item.tieuDe,
                                doanVan: item.doanVan,
                                tacGia: item.tacGia,
                                nguonSach: item.nguonSach,
                                createdById: updatedById
                            }
                        })
                    }
                }

                // 4. Update/Create/Delete Giai thoại dân gian và truyền thuyết
                if (data.giaiThoaiDanGian !== undefined) {
                    // Xóa tất cả để tạo lại
                    await tx.chiTietKyNhanGiaiThoaiDanGian.deleteMany({
                        where: { chiTietKyNhanId: id }
                    })

                    // Tạo mới từ data
                    for (const item of data.giaiThoaiDanGian) {
                        await tx.chiTietKyNhanGiaiThoaiDanGian.create({
                            data: {
                                chiTietKyNhanId: id,
                                tieuDe: item.tieuDe,
                                noiDung: item.noiDung,
                                nguon: item.nguon,
                                createdById: updatedById
                            }
                        })
                    }
                }

                // 5. Update/Create Media (thư viện ảnh)
                if (uploadedThuVienAnhFiles.length > 0 || data.thuVienAnh !== undefined) {
                    // Xóa tất cả media cũ
                    await tx.media.updateMany({
                        where: { chiTietId: id },
                        data: {
                            deletedAt: new Date(),
                            deletedById: updatedById
                        }
                    })

                    // Thêm media mới từ files upload
                    if (uploadedThuVienAnhFiles.length > 0) {
                        for (let index = 0; index < uploadedThuVienAnhFiles.length; index++) {
                            const { url, file } = uploadedThuVienAnhFiles[index]
                            await tx.media.create({
                                data: {
                                    chiTietId: id,
                                    type: 'IMAGE',
                                    url: url,
                                    fileName: file.originalname,
                                    fileSize: file.size,
                                    mimeType: file.mimetype,
                                    thuTu: index + 1,
                                    createdById: updatedById
                                }
                            })
                        }
                    } else if (data.thuVienAnh && data.thuVienAnh.length > 0) {
                        // Hoặc từ data URLs
                        for (let index = 0; index < data.thuVienAnh.length; index++) {
                            const item = data.thuVienAnh[index]
                            await tx.media.create({
                                data: {
                                    chiTietId: id,
                                    type: 'IMAGE',
                                    url: item.url,
                                    fileName: item.fileName,
                                    fileSize: item.fileSize,
                                    mimeType: item.mimeType,
                                    thuTu: index + 1,
                                    createdById: updatedById
                                }
                            })
                        }
                    }
                }

                return chiTietKyNhan
            })

            // Cleanup file cũ nếu upload thành công
            if (oldImgUrl && oldImgUrl !== uploadedImgUrl) {
                try {
                    await this.uploadService.deleteFile(oldImgUrl, 'chi-tiet-kynhan/images')
                } catch (cleanupError) {
                    console.error('Failed to cleanup old image:', cleanupError)
                }
            }

            // Fetch lại với đầy đủ relations
            const chiTietKyNhanWithRelations = await this.chiTietKyNhanRepo.findById(id)

            return {
                statusCode: HttpStatus.OK,
                data: chiTietKyNhanWithRelations,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS,
                uploadWarnings: uploadWarnings.length > 0 ? uploadWarnings : undefined
            }

        } catch (error) {
            // Cleanup uploaded files nếu có lỗi
            const filesToCleanup = [
                ...(uploadedImgUrl ? [uploadedImgUrl] : []),
                ...uploadedThuVienAnhFiles.map(item => item.url)
            ]

            for (const url of filesToCleanup) {
                try {
                    await this.uploadService.deleteFile(url, 'chi-tiet-kynhan/images')
                } catch (cleanupError) {
                    console.error('Failed to cleanup uploaded file:', cleanupError)
                }
            }

            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw ChiTietKyNhanAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }
}
