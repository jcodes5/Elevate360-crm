import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function authWrite(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource(payload.role, 'campaigns', 'update')
    if (!allowed) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch { return { error: NextResponse.json({ success: false, message: 'Invalid token' } satisfies ApiResponse, { status: 401 }) } }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const a = await authWrite(request)
  if ('error' in a) return a.error
  const { payload } = a
  try {
    const { tagId, tag } = await request.json()
    const existing = await prisma.campaign.findFirst({ where: { id: params.id, organizationId: payload.organizationId } })
    if (!existing) return NextResponse.json({ success: false, message: 'Not found' } satisfies ApiResponse, { status: 404 })
    const tags: string[] = Array.isArray((existing as any).tags) ? ((existing as any).tags as any) : []
    const newTag = tag ?? tagId
    if (!newTag) return NextResponse.json({ success: false, message: 'tag required' } satisfies ApiResponse, { status: 400 })
    const updated = await prisma.campaign.update({ where: { id: params.id }, data: { tags: Array.from(new Set([...(tags || []), newTag])) } })
    return NextResponse.json({ success: true, data: updated } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to add tag' } satisfies ApiResponse, { status: 500 }) }
}
