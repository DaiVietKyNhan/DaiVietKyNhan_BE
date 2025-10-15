import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreateLandDto } from './dto/create-land.dto'
import { UpdateLandDto } from './dto/update-land.dto'

@Injectable()
export class LandService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLandDto: CreateLandDto) {
    return this.prisma.land.create({
      data: {
        name: createLandDto.name,
        description: createLandDto.description,
        order: createLandDto.order
      }
    })
  }

  findAll() {
    return this.prisma.land.findMany({ orderBy: { order: 'asc' } })
  }

  findOne(id: number) {
    return this.prisma.land.findUnique({ where: { id } })
  }

  update(id: number, updateLandDto: UpdateLandDto) {
    return this.prisma.land.update({
      where: { id },
      data: {
        name: updateLandDto.name,
        description: updateLandDto.description,
        order: updateLandDto.order
      }
    })
  }

  remove(id: number) {
    return this.prisma.land.delete({ where: { id } })
  }
}
