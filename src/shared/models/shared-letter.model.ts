import { z } from 'zod'
import { extendZodWithOpenApi } from '@anatine/zod-openapi'

extendZodWithOpenApi(z)

export const LetterSchema = z.object({
    id: z.number().int().positive(),
    fromUserId: z.number().int().positive(),
    kyNhanId: z.number().int().positive(),
    content: z.string().min(1).max(5000),
    isRead: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    deletedById: z.number().int().positive().nullable()
})

export type Letter = z.infer<typeof LetterSchema>

