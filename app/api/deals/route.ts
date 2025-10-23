import { NextRequest, NextResponse } from 'next/server'
import { DealModel, DealSearchParams, PaginatedResult, ApiResponse } from '@/lib/models'
import { DealService } from '@/lib/services/deal-service'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

function unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', status = 401) {
  return NextResponse.json({ success: false, message, errors: [{ code, message }] } satisfies ApiResponse, { status })
}

async function requireAuth(request: NextRequest, action: 'read' | 'create' | 'update' | 'delete') {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: unauthorized('Authentication required') }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource(payload.role, 'deals', action)
    if (!allowed) {
      return { error: unauthorized('Forbidden', 'FORBIDDEN', 403) }
    }
    return { payload }
  } catch {
    return { error: unauthorized('Invalid or expired token', 'TOKEN_INVALID') }
  }
}

// GET /api/deals - Search and list deals
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, 'read')
  if ('error' in auth) return auth.error
  const { payload } = auth

  try {
    const { searchParams } = new URL(request.url)
    
    const params: DealSearchParams = {
      query: searchParams.get('query') || undefined,
      pipelineIds: searchParams.get('pipelineId')?.split(',') || undefined,
      stageIds: searchParams.get('stageIds')?.split(',') || undefined,
      assignedTo: searchParams.get('assignedTo')?.split(',') || undefined,
      status: searchParams.get('status')?.split(',') as any || undefined,
    }
    const dealService = new DealService()
    const deals = await dealService.searchDeals(params)
    return NextResponse.json(deals satisfies PaginatedResult<DealModel>)
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error', errors: [{ code: 'INTERNAL_ERROR', message: 'Internal server error' }] } satisfies ApiResponse, { status: 500 })
  }
}
