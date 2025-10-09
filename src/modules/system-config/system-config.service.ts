import { ATTENDANCE_MESSAGE, ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

import { BullQueueService } from '@/3rdService/bull/bull-queue.service'
import { BullAction, BullQueue } from '@/common/constants/bull-action.constant'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { SystemConfiggAlreadyExistsException } from './dto/system-config.error'
import {
  CreateSystemConfigBodyType,
  UpdateSystemConfigBodyType
} from './entities/system-config.entity'
import { SystemConfigRepo } from './system-config.repo'

@Injectable()
export class SystemConfigService {
  constructor(
    private systemConfigRepo: SystemConfigRepo,
    private readonly bullQueueService: BullQueueService,
    private readonly shareRoledRepo: SharedRoleRepository,
    @InjectQueue(BullQueue.ROLE_ACTIVATION) private readonly systemConfigQueue: Queue
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.systemConfigRepo.list(pagination)
    return {
      statusCode: HttpStatus.OK,
      data,
      message: ENTITY_MESSAGE.GET_LIST_SUCCESS
    }
  }

  async findById(id: number) {
    const systemConfig = await this.systemConfigRepo.findById(id)
    if (!systemConfig) {
      throw NotFoundRecordException
    }
    return {
      statusCode: HttpStatus.OK,
      data: systemConfig,
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async findByUser(userId: number, date: Date = new Date()) {
    return {}
  }

  async create({
    data,
    createdById
  }: {
    createdById: number
    data: CreateSystemConfigBodyType
  }) {
    try {
      const systemConfig = await this.systemConfigRepo.create({
        createdById,
        data: data
      })
      // add bull

      const delay =
        new Date(systemConfig.launchDate).getTime() - systemConfig.createdAt.getTime()
      if (delay > 0) {
        await this.addBullJobSystemConfigActivation(delay)
      }

      return {
        statusCode: HttpStatus.CREATED,
        data: systemConfig,
        message: ATTENDANCE_MESSAGE.CHECKIN_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw SystemConfiggAlreadyExistsException
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
    data: UpdateSystemConfigBodyType
    updatedById: number
  }) {
    try {
      const updatedSystemConfigg = await this.systemConfigRepo.update({
        id,
        updatedById,
        data
      })

      // add bull

      const delay =
        new Date(updatedSystemConfigg.launchDate).getTime() -
        updatedSystemConfigg.createdAt.getTime()
      if (delay > 0) {
        await this.addBullJobSystemConfigActivation(delay)
      }

      return {
        statusCode: HttpStatus.OK,
        data: updatedSystemConfigg,
        message: ENTITY_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw SystemConfiggAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.systemConfigRepo.delete({
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

  async addBullJobSystemConfigActivation(delay: number) {
    const roleCustomerId = await this.shareRoledRepo.getCustomerRoleId()
    if (!roleCustomerId) {
      throw NotFoundRecordException
    }
    const jobs = await this.systemConfigQueue.getJobs(['delayed'])
    const jobToUpdate = jobs.find((job) => job.data.roleId === roleCustomerId)
    if (jobToUpdate) {
      await jobToUpdate.remove() // xóa job cũ
    }

    await this.shareRoledRepo.updateActiveById(roleCustomerId, false)
    await this.bullQueueService.addJob(
      this.systemConfigQueue,
      BullAction.UPDATE_STATUS_ROLE, // tên job
      { roleId: roleCustomerId }, // ✅ dữ liệu mà processor cần
      {
        delay, // ✅ delay thực sự
        attempts: 3,
        backoff: { type: 'fixed', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: true
      }
    )
  }
}
