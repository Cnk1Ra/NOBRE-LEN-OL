import { NextRequest, NextResponse } from 'next/server'
import { mockN1Client, createN1Client } from '@/lib/n1-warehouse'

// GET /api/n1/orders - List all orders from N1
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || undefined
    const country = searchParams.get('country') || undefined
    const since = searchParams.get('since') || undefined

    // Use real client if configured, otherwise use mock
    const client = createN1Client() || mockN1Client

    const result = await client.getOrders({
      page,
      limit,
      status,
      country,
      since,
    })

    return NextResponse.json({
      success: true,
      ...result,
      lastSyncAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('N1 orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch N1 orders' },
      { status: 500 }
    )
  }
}
