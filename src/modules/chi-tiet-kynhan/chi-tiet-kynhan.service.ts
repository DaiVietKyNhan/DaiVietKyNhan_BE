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
        createdById
    }: {
        data: CreateChiTietKyNhanBodyType
        createdById: number
    }) {
        try {
            const chiTietKyNhan = await this.chiTietKyNhanRepo.create({
                createdById,
                data
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: chiTietKyNhan,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
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
        updatedById
    }: {
        id: number
        data: UpdateChiTietKyNhanBodyType
        updatedById: number
    }) {
        try {
            const existing = await this.chiTietKyNhanRepo.findById(id)
            if (!existing) {
                throw NotFoundRecordException
            }

            const updatedChiTietKyNhan = await this.chiTietKyNhanRepo.update({
                id,
                updatedById,
                data
            })

            return {
                statusCode: HttpStatus.OK,
                data: updatedChiTietKyNhan,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
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
        thuVienAnhFiles
    }: {
        data: CreateChiTietKyNhanCompleteBodyType
        createdById: number
        thuVienAnhFiles?: Express.Multer.File[]
    }) {
        console.log('=== CREATE FULL START ===')
        console.log('Service - thuVienAnhFiles received:', thuVienAnhFiles?.length || 0)
        console.log('Service - data:', JSON.stringify(data, null, 2))

        const uploadedThuVienAnhFiles: Array<{ url: string; file: Express.Multer.File }> = []
        const uploadWarnings: Array<{ fileName: string; error: string }> = []

        try {
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
                        thamKhao: data.thamKhao,
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
                console.log('Creating media - uploadedThuVienAnhFiles:', uploadedThuVienAnhFiles.length)
                console.log('Creating media - chiTietKyNhan.id:', chiTietKyNhan.id)

                if (uploadedThuVienAnhFiles.length > 0) {
                    for (let index = 0; index < uploadedThuVienAnhFiles.length; index++) {
                        const { url, file } = uploadedThuVienAnhFiles[index]
                        console.log(`Creating media ${index + 1}:`, {
                            chiTietId: chiTietKyNhan.id,
                            url: url,
                            fileName: file.originalname
                        })
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

            // Debug: Log result
            console.log('Transaction result:', result)
            console.log('Result ID:', result?.id)

            // Fetch lại với đầy đủ relations
            if (!result || !result.id) {
                throw new Error('Failed to create ChiTietKyNhan record')
            }

            const chiTietKyNhanWithRelations = await this.chiTietKyNhanRepo.findById(result.id)

            if (!chiTietKyNhanWithRelations) {
                throw new Error('Created record not found')
            }

            return {
                statusCode: HttpStatus.CREATED,
                data: chiTietKyNhanWithRelations,
                message: ENTITY_MESSAGE.CREATE_SUCCESS,
                uploadWarnings: uploadWarnings.length > 0 ? uploadWarnings : undefined
            }

        } catch (error) {
            console.error('=== CREATE FULL ERROR ===')
            console.error('Error:', error)
            console.error('Error message:', error?.message)
            // Cleanup uploaded files nếu có lỗi
            const filesToCleanup = [
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
        thuVienAnhFiles
    }: {
        data: UpdateChiTietKyNhanCompleteBodyType
        id: number
        updatedById: number
        thuVienAnhFiles?: Express.Multer.File[]
    }) {
        const uploadedThuVienAnhFiles: Array<{ url: string; file: Express.Multer.File }> = []
        const uploadWarnings: Array<{ fileName: string; error: string }> = []

        try {
            // Kiểm tra chi tiết kỳ nhân tồn tại
            const existing = await this.chiTietKyNhanRepo.findById(id)
            if (!existing) {
                throw NotFoundRecordException
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
                if (data.thamKhao !== undefined) updateData.thamKhao = data.thamKhao

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

    /**
     * Upsert (Create hoặc Update) Chi Tiết Kỳ Nhân hoàn chỉnh
     * - Nếu chưa tồn tại ChiTietKyNhan cho kyNhanId → Create
     * - Nếu đã tồn tại → Update
     */
    async upsertFull({
        data,
        userId,
        thuVienAnhFiles
    }: {
        data: CreateChiTietKyNhanCompleteBodyType
        userId: number
        thuVienAnhFiles?: Express.Multer.File[]
    }) {
        console.log('=== UPSERT FULL START ===')
        console.log('Service - kyNhanId:', data.kyNhanId)
        console.log('Service - userId:', userId)

        // Kiểm tra xem đã có ChiTietKyNhan cho kyNhanId chưa
        const existing = await this.chiTietKyNhanRepo.findByKyNhanId(data.kyNhanId)

        if (!existing || existing.length === 0) {
            // Chưa có → Tạo mới
            console.log('No existing ChiTietKyNhan found → Creating new')
            return this.createFull({
                data,
                createdById: userId,
                thuVienAnhFiles
            })
        } else {
            // Đã có → Update
            console.log('Existing ChiTietKyNhan found → Updating ID:', existing[0].id)

            // Convert CreateChiTietKyNhanCompleteBodyType sang UpdateChiTietKyNhanCompleteBodyType
            const updateData: UpdateChiTietKyNhanCompleteBodyType = {
                thamKhao: data.thamKhao,
                boiCanhLichSuVaXuatThan: data.boiCanhLichSuVaXuatThan,
                suSachVietGi: data.suSachVietGi,
                giaiThoaiDanGian: data.giaiThoaiDanGian,
                thuVienAnh: data.thuVienAnh
            }

            return this.updateFull({
                data: updateData,
                id: existing[0].id,
                updatedById: userId,
                thuVienAnhFiles
            })
        }
    }
}
