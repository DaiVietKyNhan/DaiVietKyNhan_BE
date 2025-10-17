import { HttpException, HttpStatus } from '@nestjs/common'

export const RewardAlreadyExistsException = new HttpException(
    {
        message: 'Reward already exists',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT
    },
    HttpStatus.CONFLICT
)

export const InsufficientValueException = new HttpException(
    {
        message: 'Insufficient value to exchange reward',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const RewardNotActiveException = new HttpException(
    {
        message: 'Reward is not active',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const RewardExpiredException = new HttpException(
    {
        message: 'Reward has expired',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const RewardLimitExceededException = new HttpException(
    {
        message: 'Reward limit exceeded',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const InvalidCodeException = new HttpException(
    {
        message: 'Invalid exchange code',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)
