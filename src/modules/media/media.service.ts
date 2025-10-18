import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMediaBodyType, UpdateMediaBodyType, QueryMediaType, BulkCreateMediaBodyType } from './entities/media.entities';
import { MediaRepository } from './media.repo';
import { MEDIA_MESSAGE } from '../../common/constants/media.constant';

@Injectable()
export class MediaService {
    constructor(private readonly mediaRepo: MediaRepository) { }

    async create(createMediaDto: CreateMediaBodyType, createdById?: number) {
        // Kiểm tra chi tiết kỳ nhân có tồn tại không
        const chiTietKyNhan = await this.mediaRepo.findChiTietKyNhanById(createMediaDto.chiTietId);

        if (!chiTietKyNhan) {
            throw new BadRequestException(MEDIA_MESSAGE.CHITIET_NOT_FOUND);
        }

        const data = await this.mediaRepo.create(createMediaDto, createdById);
        return {
            data,
            message: MEDIA_MESSAGE.CREATE_SUCCESS
        };
    }

    async bulkCreate(bulkCreateDto: BulkCreateMediaBodyType, createdById?: number) {
        // Kiểm tra chi tiết kỳ nhân có tồn tại không
        const chiTietKyNhan = await this.mediaRepo.findChiTietKyNhanById(bulkCreateDto.chiTietId);

        if (!chiTietKyNhan) {
            throw new BadRequestException(MEDIA_MESSAGE.CHITIET_NOT_FOUND);
        }

        if (bulkCreateDto.medias.length === 0) {
            throw new BadRequestException('Phải có ít nhất 1 media để upload');
        }

        // Validate all URLs are valid
        for (const media of bulkCreateDto.medias) {
            try {
                new URL(media.url);
            } catch {
                throw new BadRequestException('URL media không hợp lệ');
            }
        }

        const data = await this.mediaRepo.bulkCreate(bulkCreateDto, createdById);
        return {
            data,
            message: `Upload thành công ${data.length} media`
        };
    }

    async findAll(query: QueryMediaType) {
        const { page, limit } = query;
        const { data, total } = await this.mediaRepo.findMany(query);

        return {
            data: {
                results: data,
                pagination: {
                    current: page,
                    pageSize: limit,
                    totalPage: Math.ceil(total / limit),
                    totalItem: total,
                },
            },
            message: MEDIA_MESSAGE.GET_LIST_SUCCESS
        };
    }

    async findOne(id: number) {
        const media = await this.mediaRepo.findById(id);

        if (!media) {
            throw new NotFoundException(MEDIA_MESSAGE.NOT_FOUND);
        }

        return media;
    }

    async findOneWithResponse(id: number) {
        const data = await this.findOne(id);
        return {
            data,
            message: MEDIA_MESSAGE.GET_SUCCESS
        };
    }

    async update(id: number, updateMediaDto: UpdateMediaBodyType) {
        const existingMedia = await this.findOne(id);

        // Nếu có chiTietId trong update, kiểm tra chi tiết kỳ nhân có tồn tại không
        if (updateMediaDto.chiTietId) {
            const chiTietKyNhan = await this.mediaRepo.findChiTietKyNhanById(updateMediaDto.chiTietId);

            if (!chiTietKyNhan) {
                throw new BadRequestException(MEDIA_MESSAGE.CHITIET_NOT_FOUND);
            }
        }

        const data = await this.mediaRepo.update(id, updateMediaDto);
        return {
            data,
            message: MEDIA_MESSAGE.UPDATE_SUCCESS
        };
    }

    async remove(id: number, deletedById?: number) {
        const existingMedia = await this.findOne(id);

        const data = deletedById
            ? await this.mediaRepo.softDelete(id, deletedById)
            : await this.mediaRepo.delete(id);

        return {
            data,
            message: MEDIA_MESSAGE.DELETE_SUCCESS
        };
    }

    async deleteByChiTietId(chiTietId: number, deletedById: number) {
        const chiTietKyNhan = await this.mediaRepo.findChiTietKyNhanById(chiTietId);

        if (!chiTietKyNhan) {
            throw new NotFoundException(MEDIA_MESSAGE.CHITIET_NOT_FOUND);
        }

        await this.mediaRepo.deleteByChiTietId(chiTietId, deletedById);
        return {
            message: 'Xóa tất cả media thành công'
        };
    }

    async findByChiTietId(chiTietId: number) {
        const chiTietKyNhan = await this.mediaRepo.findChiTietKyNhanById(chiTietId);

        if (!chiTietKyNhan) {
            throw new NotFoundException(MEDIA_MESSAGE.CHITIET_NOT_FOUND);
        }

        const data = await this.mediaRepo.findByChiTietId(chiTietId);
        return {
            data,
            message: MEDIA_MESSAGE.GET_LIST_SUCCESS
        };
    }

    async findByType(type: string) {
        const data = await this.mediaRepo.findByType(type);
        return {
            data,
            message: MEDIA_MESSAGE.GET_LIST_SUCCESS
        };
    }
}
