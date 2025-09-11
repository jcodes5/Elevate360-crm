import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

function unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', status = 401) {
  return NextResponse.json({ success: false, message, errors: [{ code, message }] } satisfies ApiResponse, { status })
}

async function requireAuth(request: NextRequest, action: 'update') {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: unauthorized('Authentication required') }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', 'update')
    if (!allowed.includes(payload.role)) return { error: unauthorized('Forbidden', 'FORBIDDEN', 403) }
    return { payload }
  } catch {
    return { error: unauthorized('Invalid or expired token', 'TOKEN_INVALID') }
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request, 'update')
  if ('error' in auth) return auth.error
  const { payload } = auth
  try {
    const body = await request.json()
    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        subject: body.subject ?? undefined,
        content: body.htmlContent ?? body.textContent ?? body.content ?? undefined,
        updatedAt: new Date(),
      },
    })
    if (updated.organizationId !== payload.organizationId) return unauthorized('Forbidden', 'FORBIDDEN', 403)
    return NextResponse.json({ success: true, data: updated, message: 'Content updated' } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to update content' } satisfies ApiResponse, { status: 500 })
  }
}
