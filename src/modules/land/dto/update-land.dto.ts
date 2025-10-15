import { PartialType } from '@nestjs/mapped-types'
import { CreateLandDto } from './create-land.dto'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UpdateLandDto extends PartialType(CreateLandDto) {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsInt()
	@Min(1)
	order?: number
}


