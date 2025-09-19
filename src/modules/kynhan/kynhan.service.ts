import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKyNhanBodyType, UpdateKyNhanBodyType, QueryKyNhanType } from './entities/kynhan.entities';
import { KyNhanRepository } from './kynhan.repo';
import { KYNHAN_MESSAGE } from '../../common/constants/kynhan.constant';

@Injectable()
export class KyNhanService {
    constructor(private readonly kyNhanRepo: KyNhanRepository) { }

    //#region create
    async create(createKyNhanDto: CreateKyNhanBodyType) {
        const data = await this.kyNhanRepo.create(createKyNhanDto);
        return {
            data,
            message: KYNHAN_MESSAGE.CREATE_SUCCESS
        };
    }
    //#endregion

    //#region update
    async update(id: number, updateKyNhanDto: UpdateKyNhanBodyType) {
        const existingKyNhan = await this.findOne(id);

        const data = await this.kyNhanRepo.update(id, updateKyNhanDto);
        return {
            data,
            message: KYNHAN_MESSAGE.UPDATE_SUCCESS
        };
    }
    //#endregion

    //#region remove
    async remove(id: number) {
        const existingKyNhan = await this.findOne(id);

        const data = await this.kyNhanRepo.softDelete(id);
        return {
            data,
            message: KYNHAN_MESSAGE.DELETE_SUCCESS
        };
    }
    //#endregion

    //#region restore
    async restore(id: number) {
        const kyNhan = await this.kyNhanRepo.findFirstDeleted({ id, deletedAt: { not: null } });

        if (!kyNhan) {
            throw new NotFoundException(KYNHAN_MESSAGE.NOT_FOUND_DELETED);
        }

        const data = await this.kyNhanRepo.restore(id);
        return {
            data,
            message: KYNHAN_MESSAGE.RESTORE_SUCCESS
        };
    }
    //#endregion

    //#region findAll
    async findAll(query: QueryKyNhanType) {
        const { page, limit } = query;
        const { data, total } = await this.kyNhanRepo.findMany(query);

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
            message: KYNHAN_MESSAGE.GET_LIST_SUCCESS
        };
    }
    //#endregion

    //#region findOne
    async findOne(id: number) {
        const kyNhan = await this.kyNhanRepo.findFirst({ id, deletedAt: null });

        if (!kyNhan) {
            throw new NotFoundException(KYNHAN_MESSAGE.NOT_FOUND);
        }

        return kyNhan;
    }

    async findOneWithResponse(id: number) {
        const data = await this.findOne(id);
        return {
            data,
            message: KYNHAN_MESSAGE.GET_SUCCESS
        };
    }
    //#endregion

    //#region findFirstDeleted
    async findFirstDeleted(id: number) {
        return this.kyNhanRepo.findFirstDeleted({ id, deletedAt: { not: null } });
    }
    //#endregion

}
