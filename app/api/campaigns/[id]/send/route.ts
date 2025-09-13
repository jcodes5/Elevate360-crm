import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function requireAuth(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource(payload.role, 'campaigns', 'update')
    if (!allowed) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch {
    return { error: NextResponse.json({ success: false, message: 'Invalid or expired token' } satisfies ApiResponse, { status: 401 }) }
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { payload } = auth
  try {
    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'SENDING', sentAt: new Date(), updatedAt: new Date() }
    })
    if (updated.organizationId !== payload.organizationId) {
      return NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 })
    }
    return NextResponse.json({ success: true, data: updated, message: 'Campaign sending started' } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to send campaign' } satisfies ApiResponse, { status: 500 })
  }
}
