import { NextRequest } from 'next/server'
import { mockN1Client, createN1Client } from '@/lib/n1-warehouse'

// GET /api/n1/events - Server-Sent Events for real-time updates
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
      )

      // Use real client if configured, otherwise use mock
      const client = createN1Client() || mockN1Client

      // Poll for updates every 10 seconds
      let lastCheck = new Date().toISOString()
      let isRunning = true

      const pollInterval = setInterval(async () => {
        if (!isRunning) return

        try {
          // Fetch orders updated since last check
          const result = await client.getOrders({
            since: lastCheck,
            limit: 50,
          })

          if (result.orders.length > 0) {
            // Send updates for each changed order
            for (const order of result.orders) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'order_update',
                    order,
                    timestamp: new Date().toISOString(),
                  })}\n\n`
                )
              )
            }
          }

          // Send heartbeat
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString(),
                ordersChecked: result.total,
              })}\n\n`
            )
          )

          lastCheck = new Date().toISOString()
        } catch (error) {
          console.error('SSE poll error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: 'Polling error',
                timestamp: new Date().toISOString(),
              })}\n\n`
            )
          )
        }
      }, 10000) // Poll every 10 seconds

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        isRunning = false
        clearInterval(pollInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
