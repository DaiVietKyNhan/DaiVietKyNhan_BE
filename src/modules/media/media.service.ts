import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMediaBodyType, UpdateMediaBodyType, QueryMediaType } from './entities/media.entities';
import { MediaRepository } from './media.repo';
import { MEDIA_MESSAGE } from '../../common/constants/media.constant';

@Injectable()
export class MediaService {
    constructor(private readonly mediaRepo: MediaRepository) { }

    async create(createMediaDto: CreateMediaBodyType) {
        // Kiểm tra chi tiết kỳ nhân có tồn tại không
        const chiTietKyNhan = await this.mediaRepo.findChiTietKyNhanById(createMediaDto.chiTietId);

        if (!chiTietKyNhan) {
            throw new BadRequestException(MEDIA_MESSAGE.CHITIET_NOT_FOUND);
        }

        const data = await this.mediaRepo.create(createMediaDto);
        return {
            data,
            message: MEDIA_MESSAGE.CREATE_SUCCESS
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
        const media = await this.mediaRepo.findUnique({ id });

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

    async remove(id: number) {
        const existingMedia = await this.findOne(id);

        const data = await this.mediaRepo.delete(id);
        return {
            data,
            message: MEDIA_MESSAGE.DELETE_SUCCESS
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
