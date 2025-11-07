import { z } from 'zod'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'

extendZodWithOpenApi(z)

export const LetterSchema = z.object({
    id: z.number().int().positive(),
    fromUserId: z.number().int().positive(),
    from: z.string(),
    to: z.string(),
    content: z.string(),
    status: z.enum(['PENDING', 'REMOVE', 'PUBLIC']),
    isFirstPublic: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    deletedById: z.number().int().positive().nullable()
})

export type Letter = z.infer<typeof LetterSchema>

