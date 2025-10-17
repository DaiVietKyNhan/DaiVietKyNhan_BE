import { HttpException, HttpStatus } from '@nestjs/common'

export const AchievementAlreadyExistsException = new HttpException(
    {
        message: 'Achievement already exists',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT
    },
    HttpStatus.CONFLICT
)
