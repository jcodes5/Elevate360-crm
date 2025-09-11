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

export async function DELETE(request: NextRequest, { params }: { params: { id: string, tag: string } }) {
  const a = await authWrite(request)
  if ('error' in a) return a.error
  const { payload } = a
  try {
    const existing = await prisma.campaign.findFirst({ where: { id: params.id, organizationId: payload.organizationId } })
    if (!existing) return NextResponse.json({ success: false, message: 'Not found' } satisfies ApiResponse, { status: 404 })
    const tags: string[] = Array.isArray((existing as any).tags) ? ((existing as any).tags as any) : []
    const updated = await prisma.campaign.update({ where: { id: params.id }, data: { tags: tags.filter(t => t !== params.tag) } })
    return NextResponse.json({ success: true, data: updated } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to remove tag' } satisfies ApiResponse, { status: 500 }) }
}
