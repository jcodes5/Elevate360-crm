import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'

export async function POST(_request: NextRequest) {
  try {
    const now = new Date()
    const due = await prisma.campaign.findMany({
      where: { status: 'SCHEDULED', scheduledAt: { lte: now } },
      take: 50,
    })

    for (const c of due) {
      await prisma.campaign.update({ where: { id: c.id }, data: { status: 'SENDING', sentAt: new Date(), updatedAt: new Date() } })
      // In production: enqueue jobs to a worker to deliver messages per channel
    }

    return NextResponse.json({ success: true, data: { processed: due.length } } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to process campaigns' } satisfies ApiResponse, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'POST to trigger processing of scheduled campaigns' } satisfies ApiResponse)
}
