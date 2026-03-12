const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const existing = requests.get(identifier)

  if (!existing || now > existing.resetAt) {
    requests.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0 }
  }

  existing.count++
  return { success: true, remaining: limit - existing.count }
}

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')
    ?.split(',')[0]?.trim() || 'unknown'
}
