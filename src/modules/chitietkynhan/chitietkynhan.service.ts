import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateChiTietKyNhanBodyType, UpdateChiTietKyNhanBodyType, QueryChiTietKyNhanType } from './entities/chitietkynhan.entities';
import { ChiTietKyNhanRepository } from './chitietkynhan.repo';
import { CHITIETKYNHAN_MESSAGE } from '../../common/constants/chitietkynhan.constant';

@Injectable()
export class ChiTietKyNhanService {
    constructor(private readonly chiTietKyNhanRepo: ChiTietKyNhanRepository) { }

    async create(createChiTietKyNhanDto: CreateChiTietKyNhanBodyType) {
        // Kiểm tra kỳ nhân có tồn tại không
        const kyNhan = await this.chiTietKyNhanRepo.findKyNhanById(createChiTietKyNhanDto.kyNhanId);

        if (!kyNhan) {
            throw new BadRequestException(CHITIETKYNHAN_MESSAGE.KYNHAN_NOT_FOUND);
        }

        const data = await this.chiTietKyNhanRepo.create(createChiTietKyNhanDto);
        return {
            data,
            message: CHITIETKYNHAN_MESSAGE.CREATE_SUCCESS
        };
    }

    async findAll(query: QueryChiTietKyNhanType) {
        const { page, limit } = query;
        const { data, total } = await this.chiTietKyNhanRepo.findMany(query);

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
            message: CHITIETKYNHAN_MESSAGE.GET_LIST_SUCCESS
        };
    }

    async findOne(id: number) {
        const chiTietKyNhan = await this.chiTietKyNhanRepo.findFirst({ id, deletedAt: null });

        if (!chiTietKyNhan) {
            throw new NotFoundException(CHITIETKYNHAN_MESSAGE.NOT_FOUND);
        }

        return chiTietKyNhan;
    }

    async findOneWithResponse(id: number) {
        const data = await this.findOne(id);
        return {
            data,
            message: CHITIETKYNHAN_MESSAGE.GET_SUCCESS
        };
    }

    async update(id: number, updateChiTietKyNhanDto: UpdateChiTietKyNhanBodyType) {
        const existingChiTietKyNhan = await this.findOne(id);

        // Nếu có kyNhanId trong update, kiểm tra kỳ nhân có tồn tại không
        if (updateChiTietKyNhanDto.kyNhanId) {
            const kyNhan = await this.chiTietKyNhanRepo.findKyNhanById(updateChiTietKyNhanDto.kyNhanId);

            if (!kyNhan) {
                throw new BadRequestException(CHITIETKYNHAN_MESSAGE.KYNHAN_NOT_FOUND);
            }
        }

        const data = await this.chiTietKyNhanRepo.update(id, updateChiTietKyNhanDto);
        return {
            data,
            message: CHITIETKYNHAN_MESSAGE.UPDATE_SUCCESS
        };
    }

    async remove(id: number) {
        const existingChiTietKyNhan = await this.findOne(id);

        const data = await this.chiTietKyNhanRepo.softDelete(id);
        return {
            data,
            message: CHITIETKYNHAN_MESSAGE.DELETE_SUCCESS
        };
    }

    async restore(id: number) {
        const chiTietKyNhan = await this.chiTietKyNhanRepo.findFirstDeleted({ id, deletedAt: { not: null } });

        if (!chiTietKyNhan) {
            throw new NotFoundException(CHITIETKYNHAN_MESSAGE.NOT_FOUND_DELETED);
        }

        const data = await this.chiTietKyNhanRepo.restore(id);
        return {
            data,
            message: CHITIETKYNHAN_MESSAGE.RESTORE_SUCCESS
        };
    }

    async findByKyNhanId(kyNhanId: number) {
        const kyNhan = await this.chiTietKyNhanRepo.findKyNhanById(kyNhanId);

        if (!kyNhan) {
            throw new NotFoundException(CHITIETKYNHAN_MESSAGE.KYNHAN_NOT_FOUND);
        }

        const data = await this.chiTietKyNhanRepo.findByKyNhanId(kyNhanId);
        return {
            data,
            message: CHITIETKYNHAN_MESSAGE.GET_LIST_SUCCESS
        };
    }
}
