import { HttpException, HttpStatus } from '@nestjs/common'

export const RewardAlreadyExistsException = new HttpException(
    {
        message: 'Thưởng đã tồn tại',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT
    },
    HttpStatus.CONFLICT
)

// Helper function để tạo message theo reward type
export const createInsufficientValueException = (type: 'POINT' | 'COIN') => {
    const typeText = type === 'POINT' ? 'điểm' : 'xu'
    return new HttpException(
        {
            message: `Không đủ ${typeText} để đổi thưởng`,
            error: 'Bad Request',
            statusCode: HttpStatus.BAD_REQUEST
        },
        HttpStatus.BAD_REQUEST
    )
}

export const InsufficientValueException = new HttpException(
    {
        message: 'Không đủ type để đổi thưởng',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const RewardNotActiveException = new HttpException(
    {
        message: 'Thưởng không hoạt động',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const RewardExpiredException = new HttpException(
    {
        message: 'Thưởng đã hết hạn',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const RewardLimitExceededException = new HttpException(
    {
        message: 'Giới hạn thưởng đã vượt',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)

export const InvalidCodeException = new HttpException(
    {
        message: 'Mã đổi thưởng không hợp lệ',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST
    },
    HttpStatus.BAD_REQUEST
)
