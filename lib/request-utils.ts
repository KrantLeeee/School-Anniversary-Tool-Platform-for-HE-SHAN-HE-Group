import { NextRequest } from 'next/server'

export interface ClientInfo {
  ip: string
  userAgent: string
}

/**
 * Extract client IP and user agent from request headers
 */
export function getClientInfo(req: NextRequest): ClientInfo {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || ''
  return { ip, userAgent }
}
