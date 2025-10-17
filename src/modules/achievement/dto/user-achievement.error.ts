import { HttpException, HttpStatus } from '@nestjs/common'

export const UserAchievementAlreadyExistsException = new HttpException(
    {
        message: 'User achievement already exists',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT
    },
    HttpStatus.CONFLICT
)
