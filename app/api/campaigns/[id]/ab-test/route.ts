import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function authWrite(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', 'update')
    if (!allowed.includes(payload.role)) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch { return { error: NextResponse.json({ success: false, message: 'Invalid token' } satisfies ApiResponse, { status: 401 }) } }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const a = await authWrite(request)
  if ('error' in a) return a.error
  const { payload } = a
  try {
    const body = await request.json()
    const updated = await prisma.campaign.update({ where: { id: params.id }, data: { isABTest: true, abTestConfig: body, updatedAt: new Date() } })
    if (updated.organizationId !== payload.organizationId) return NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 })
    return NextResponse.json({ success: true, data: updated, message: 'A/B test configured' } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to configure A/B test' } satisfies ApiResponse, { status: 500 }) }
}
