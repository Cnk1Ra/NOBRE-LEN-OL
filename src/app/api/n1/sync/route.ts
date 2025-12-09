import { NextRequest, NextResponse } from 'next/server'
import { mockN1Client, createN1Client } from '@/lib/n1-warehouse'

// POST /api/n1/sync - Trigger a full sync with N1 Warehouse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const since = body.since as string | undefined

    // Use real client if configured, otherwise use mock
    const client = createN1Client() || mockN1Client

    const result = await client.syncOrders(since)

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Sincronização concluída: ${result.synced} pedidos atualizados`
        : `Sincronização com erros: ${result.errors} falhas`,
      synced: result.synced,
      errors: result.errors,
      lastSyncAt: result.lastSyncAt,
    })
  } catch (error) {
    console.error('N1 sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync with N1' },
      { status: 500 }
    )
  }
}

// GET /api/n1/sync - Get sync status
export async function GET() {
  try {
    // Use real client if configured, otherwise use mock
    const client = createN1Client() || mockN1Client

    const status = await client.testConnection()

    return NextResponse.json({
      connected: status.success,
      message: status.message,
      mode: createN1Client() ? 'production' : 'demo',
      lastSyncAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('N1 status error:', error)
    return NextResponse.json(
      { connected: false, error: 'Failed to check N1 status' },
      { status: 500 }
    )
  }
}
