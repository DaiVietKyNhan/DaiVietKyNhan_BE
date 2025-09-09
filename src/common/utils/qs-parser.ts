export function parseQs(qs?: string): {
  where?: Record<string, any>
  orderBy?: Record<string, 'asc' | 'desc'>
} {
  if (!qs) return {}

  const where: Record<string, any> = {}
  let orderBy: Record<string, 'asc' | 'desc'> | undefined

  const parts = qs.split(',')
  for (const part of parts) {
    // sort:-field
    if (part.startsWith('sort:')) {
      const field = part.replace('sort:', '')
      if (field.startsWith('-')) {
        orderBy = { [field.slice(1)]: 'desc' }
      } else {
        orderBy = { [field]: 'asc' }
      }
      continue
    }

    // filter: field:op:value hoặc field:value
    const tokens = part.split(':')
    if (tokens.length === 2) {
      const [field, value] = tokens
      where[field] = isNaN(Number(value)) ? value : Number(value) // auto parse number
    } else if (tokens.length === 3) {
      const [field, op, value] = tokens
      if (op === 'eq') where[field] = isNaN(Number(value)) ? value : Number(value)
      if (op === 'like') where[field] = { contains: value, mode: 'insensitive' }
    }
  }

  return { where, orderBy }
}
