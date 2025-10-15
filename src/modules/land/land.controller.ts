import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { CreateLandDto } from './dto/create-land.dto'
import { UpdateLandDto } from './dto/update-land.dto'
import { LandService } from './land.service'

@Controller('lands')
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Post()
  create(@Body() createLandDto: CreateLandDto) {
    return this.landService.create(createLandDto)
  }

  @Get()
  findAll() {
    return this.landService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.landService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLandDto: UpdateLandDto) {
    return this.landService.update(id, updateLandDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.landService.remove(id)
  }
}
