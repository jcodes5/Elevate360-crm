import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

function unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', status = 401) {
  return NextResponse.json({ success: false, message, errors: [{ code, message }] } satisfies ApiResponse, { status })
}

async function requireAuth(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: unauthorized('Authentication required') }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', 'update')
    if (!allowed.includes(payload.role)) return { error: unauthorized('Forbidden', 'FORBIDDEN', 403) }
    return { payload }
  } catch { return { error: unauthorized('Invalid or expired token', 'TOKEN_INVALID') } }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { payload } = auth
  try {
    const updated = await prisma.campaign.update({ where: { id: params.id }, data: { status: 'PAUSED', updatedAt: new Date() } })
    if (updated.organizationId !== payload.organizationId) return unauthorized('Forbidden', 'FORBIDDEN', 403)
    return NextResponse.json({ success: true, data: updated, message: 'Campaign paused' } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to pause campaign' } satisfies ApiResponse, { status: 500 }) }
}
