import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

import { BullQueueService } from '@/3rdService/bull/bull-queue.service'
import { BullAction, BullQueue } from '@/common/constants/bull-action.constant'
import { RoleName } from '@/common/constants/role.constant'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import {
  SystemConfiggAlreadyExistsException,
  SystemConfiggHasActiveExistsException
} from './dto/system-config.error'
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
    private readonly sharedUserRepo: SharedUserRepository,
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

  async findByActiveWithAmountUser(isActive: boolean) {
    const [systemConfig, amountUser] = await Promise.all([
      this.systemConfigRepo.findByActive(isActive),
      await this.sharedUserRepo.countByRoleName(RoleName.Customer)
    ])
    return {
      statusCode: HttpStatus.OK,
      data: {
        systemConfig: systemConfig,
        amountUser: systemConfig !== null ? amountUser : 0
      },
      message: ENTITY_MESSAGE.GET_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    createdById: number
    data: CreateSystemConfigBodyType
  }) {
    try {
      const date = new Date()
      const vnString = date.toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh'
      })
      const vnDate = new Date(vnString)
      vnDate.setHours(vnDate.getHours() + 7)

      // check xem truoc do co cai nao toi ngay hien tai con hieu luc khong
      const existingConfig = await this.systemConfigRepo.findActiveConfig(vnDate)

      if (data.isActive && existingConfig) {
        throw SystemConfiggHasActiveExistsException
      }
      const systemConfig = await this.systemConfigRepo.create({
        createdById,
        data: data
      })
      if (systemConfig.isActive) {
        // add bull

        const time = vnDate.getTime()
        const delay = new Date(systemConfig.launchDate).getTime() - time
        if (delay > 0) {
          await this.addBullJobSystemConfigActivation(delay, systemConfig.id)
        }
      }

      return {
        statusCode: HttpStatus.CREATED,
        data: systemConfig,
        message: ENTITY_MESSAGE.CREATE_SUCCESS
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
      // add bull
      const date = new Date()
      const vnString = date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
      const vnDate = new Date(vnString)
      vnDate.setHours(vnDate.getHours() + 7)
      const time = vnDate.getTime()

      //lay ra cai dang hieu luc
      const existingConfig = await this.systemConfigRepo.findActiveConfig(vnDate)
      //check active === true
      if (data.isActive === true) {
        // nếu có cái đang hiệu lực, và không phải là chính nó -> thì không cho update
        if (existingConfig && id !== existingConfig.id) {
          throw SystemConfiggHasActiveExistsException
        }
        //neu khong thi update dong thoi update bull,
        const updatedSystemConfigg = await this.systemConfigRepo.update({
          id,
          updatedById,
          data
        })
        //update update bull
        const delay = new Date(updatedSystemConfigg.launchDate).getTime() - time
        if (delay > 0) {
          await this.addBullJobSystemConfigActivation(delay, updatedSystemConfigg.id)
        }
        return {
          statusCode: HttpStatus.OK,
          data: updatedSystemConfigg,
          message: ENTITY_MESSAGE.UPDATE_SUCCESS
        }
      }
      // neu khong phai active, thi cho update thoai mai, del bull
      // xem cai hieu luc co phai la no khong, neu phai thi xoa bull
      if (existingConfig && existingConfig.id === id) {
        await this.removeBullJobSystemConfigActivation()
      }
      const updatedSystemConfigg = await this.systemConfigRepo.update({
        id,
        updatedById,
        data
      })

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
      // 🧩 1. Lấy roleCustomerId (hoặc data liên quan tới job)
      const roleCustomerId = await this.shareRoledRepo.getCustomerRoleId()
      if (!roleCustomerId) {
        throw NotFoundRecordException
      }

      // 🧩 2. Tìm job trong queue có data trùng khớp để xóa
      const jobs = await this.systemConfigQueue.getJobs(['delayed', 'waiting', 'active'])
      const jobToRemove = jobs.find((job) => {
        if (!job || !job.data) return false
        return job.data.roleId === roleCustomerId
      })

      if (jobToRemove) {
        const roleCustomerId = await this.shareRoledRepo.getCustomerRoleId()
        if (!roleCustomerId) {
          throw NotFoundRecordException
        }
        const [,] = await Promise.all([
          this.shareRoledRepo.updateActiveById(roleCustomerId, true),
          jobToRemove.remove()
        ])
      }

      // 🧩 3. Xóa system config trong DB
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

  async addBullJobSystemConfigActivation(delay: number, systemConfigId: number) {
    const roleCustomerId = await this.shareRoledRepo.getCustomerRoleId()
    if (!roleCustomerId) {
      throw NotFoundRecordException
    }
    const jobs = await this.systemConfigQueue.getJobs(['delayed'])
    const jobToUpdate = jobs.find((job) => {
      if (!job || !job.data) return false
      return job.data.roleId === roleCustomerId
    })
    if (jobToUpdate) {
      await jobToUpdate.remove() // xóa job cũ
    }

    await this.shareRoledRepo.updateActiveById(roleCustomerId, false)
    await this.bullQueueService.addJob(
      this.systemConfigQueue,
      BullAction.UPDATE_STATUS_ROLE, // tên job
      { roleId: roleCustomerId, systemConfigId }, // ✅ dữ liệu mà processor cần
      {
        delay, // ✅ delay thực sự
        attempts: 3,
        backoff: { type: 'fixed', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: true
      }
    )
  }

  async removeBullJobSystemConfigActivation() {
    // 🧩 1. Lấy roleCustomerId (hoặc data liên quan tới job)
    const roleCustomerId = await this.shareRoledRepo.getCustomerRoleId()
    if (!roleCustomerId) {
      throw NotFoundRecordException
    }
    // 🧩 2. Tìm job trong queue có data trùng khớp để xóa
    const jobs = await this.systemConfigQueue.getJobs(['delayed', 'waiting', 'active'])
    const jobToRemove = jobs.find((job) => {
      if (!job || !job.data) return false
      return job.data.roleId === roleCustomerId
    })

    if (jobToRemove) {
      const roleCustomerId = await this.shareRoledRepo.getCustomerRoleId()
      if (!roleCustomerId) {
        throw NotFoundRecordException
      }
      const [,] = await Promise.all([
        this.shareRoledRepo.updateActiveById(roleCustomerId, true),
        jobToRemove.remove()
      ])
    }
  }
}
