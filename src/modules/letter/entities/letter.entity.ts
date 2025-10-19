import { ENTITY_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/common/utils/id.validation'
import { KyNhanSchema } from '@/modules/kynhan/entities/kynhan.entities'
import { LetterSchema } from '@/shared/models/shared-letter.model'
import { UserSchema } from '@/shared/models/shared-user.model'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

// Create Letter Body Schema
export const CreateLetterBodySchema = z.object({
    kyNhanId: z.number().int().positive().openapi({ description: 'ID Kỳ Nhân yêu thích' }),
    content: z.string().min(1).max(5000).openapi({ description: 'Nội dung thư' })
})

// Create Letter Response Schema
export const CreateLetterResSchema = z.object({
    statusCode: z.number(),
    data: LetterSchema.extend({
        fromUser: UserSchema.pick({ id: true, name: true, avatar: true }),
        kyNhan: KyNhanSchema.pick({ id: true, name: true, imgUrl: true }),
        isFirstLetter: z.boolean().optional()
    }),
    message: z.string()
})

// Get Letter Response Schema
export const GetLetterResSchema = z.object({
    statusCode: z.number(),
    data: LetterSchema.extend({
        fromUser: UserSchema.pick({ id: true, name: true, avatar: true }),
        kyNhan: KyNhanSchema.pick({ id: true, name: true, imgUrl: true })
    }),
    message: z.string()
})

// Get Letter List Response Schema
export const GetLetterListResSchema = z.object({
    statusCode: z.number(),
    data: z.array(
        LetterSchema.extend({
            fromUser: UserSchema.pick({ id: true, name: true, avatar: true }),
            kyNhan: KyNhanSchema.pick({ id: true, name: true, imgUrl: true })
        })
    ),
    message: z.string()
})

// Update Letter Body Schema
export const UpdateLetterBodySchema = z.object({
    isRead: z.boolean().optional()
})

// Update Letter Response Schema
export const UpdateLetterResSchema = GetLetterResSchema

// Get Params Schema
export const GetLetterParamsSchema = z.object({
    letterId: checkIdSchema(ENTITY_MESSAGE.ID_INVALID)
})

