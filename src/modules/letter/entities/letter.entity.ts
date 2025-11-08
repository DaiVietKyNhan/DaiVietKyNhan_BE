import { ENTITY_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/common/utils/id.validation'
import { LetterSchema } from '@/shared/models/shared-letter.model'
import { UserSchema } from '@/shared/models/shared-user.model'
import { PaginationQuerySchema } from '@/shared/models/request.model'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'
import { patchNestJsSwagger } from 'nestjs-zod'
import { z } from 'zod'

extendZodWithOpenApi(z)
patchNestJsSwagger()

// Create Letter Body Schema
export const CreateLetterBodySchema = z.object({
    from: z.string(),
    to: z.string(),
    content: z.string(),
})

// Create Letter Response Schema
export const CreateLetterResSchema = z.object({
    statusCode: z.number(),
    data: LetterSchema.extend({
        fromUser: UserSchema.pick({ id: true, name: true, avatar: true })
    }),
    message: z.string()
})

// Get Letter Response Schema
export const GetLetterResSchema = z.object({
    statusCode: z.number(),
    data: LetterSchema.extend({
        fromUser: UserSchema.pick({ id: true, name: true, avatar: true })
    }),
    message: z.string()
})

// Get Letter List Response Schema
export const GetLetterListResSchema = z.object({
    statusCode: z.number(),
    data: z.array(
        LetterSchema.extend({
            fromUser: UserSchema.pick({ id: true, name: true, avatar: true })
        })
    ),
    message: z.string()
})

// Update Letter Body Schema
export const UpdateLetterFullBodySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['PENDING', 'REMOVE', 'PUBLIC']).optional(),
    isFirstPublic: z.boolean().optional()
})
// Update Letter Body Schema
export const UpdateLetterBodySchema = z.object({
    status: z.enum(['PENDING', 'REMOVE', 'PUBLIC']).optional()
})

// Letter item schema for bulk update
const LetterItemSchema = z.object({
    letterId: z.number(),
    fromUserId: z.number()
})

// Bulk Update Letter Body Schema
export const BulkUpdateLetterBodySchema = z.object({
    letters: z.array(LetterItemSchema).min(1),
    status: z.enum(['PENDING', 'REMOVE', 'PUBLIC'])
})

// Update Letter Response Schema
export const UpdateLetterResSchema = GetLetterResSchema

// Bulk Update Letter Response Schema
export const BulkUpdateLetterResSchema = z.object({
    statusCode: z.number(),
    data: z.array(
        LetterSchema.extend({
            fromUser: UserSchema.pick({ id: true, name: true, avatar: true })
        })
    ),
    message: z.string()
})

// Get Params Schema
export const GetLetterParamsSchema = z.object({
    letterId: checkIdSchema(ENTITY_MESSAGE.ID_INVALID)
})

// List Letter Query Schema (extends PaginationQuerySchema)
export const ListLetterQuerySchema = PaginationQuerySchema.extend({
    filterByUserId: z
        .union([
            z.boolean(),
            z.string().transform((val, ctx) => {
                const lowerVal = val.toLowerCase().trim()
                if (lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes') return true
                if (lowerVal === 'false' || lowerVal === '0' || lowerVal === 'no') return false
                // If invalid value, throw error to inform user
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid value for filterByUserId: "${val}". Must be "true" or "false".`
                })
                return z.NEVER
            })
        ])
        .optional()
        .default(true)
})

// Types
export type CreateLetterBodyType = z.infer<typeof CreateLetterBodySchema>
export type UpdateLetterBodyType = z.infer<typeof UpdateLetterBodySchema>
export type UpdateLetterFullBodyType = z.infer<typeof UpdateLetterFullBodySchema>
export type BulkUpdateLetterBodyType = z.infer<typeof BulkUpdateLetterBodySchema>
export type LetterType = z.infer<typeof LetterSchema>
export type ListLetterQueryType = z.infer<typeof ListLetterQuerySchema>

// Fields for parseQs
type LetterFieldType = keyof z.infer<typeof LetterSchema>
export const LETTER_FIELDS = Object.keys(LetterSchema.shape) as LetterFieldType[]

