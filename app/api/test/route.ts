import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Test API GET called')
  return NextResponse.json({
    success: true,
    message: 'Test GET endpoint working',
    timestamp: new Date().toISOString(),
    method: 'GET'
  })
}

export async function POST(request: NextRequest) {
  console.log('Test API POST called')
  
  try {
    const body = await request.json()
    console.log('Test API received body:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Test POST endpoint working',
      timestamp: new Date().toISOString(),
      method: 'POST',
      receivedData: body
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to parse request body',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}
