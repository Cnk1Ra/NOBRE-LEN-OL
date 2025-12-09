import { NextRequest, NextResponse } from 'next/server'
import { N1WarehouseClient, N1WebhookPayload } from '@/lib/n1-warehouse'
import { prisma } from '@/lib/prisma'

// Webhook events store for SSE (in-memory for demo, use Redis in production)
const webhookEvents: N1WebhookPayload[] = []
const MAX_EVENTS = 100

// POST /api/n1/webhook - Receive webhooks from N1 Warehouse
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-n1-signature') || ''
    const rawBody = await request.text()

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.N1_WEBHOOK_SECRET
    if (webhookSecret) {
      const client = new N1WarehouseClient({
        apiUrl: process.env.N1_API_URL || '',
        apiToken: process.env.N1_API_TOKEN || '',
        webhookSecret,
      })

      if (!client.verifyWebhookSignature(rawBody, signature)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const payload: N1WebhookPayload = JSON.parse(rawBody)

    // Log the event
    console.log(`[N1 Webhook] ${payload.event}:`, payload.data)

    // Store event for SSE (in-memory, would use Redis/DB in production)
    webhookEvents.unshift(payload)
    if (webhookEvents.length > MAX_EVENTS) {
      webhookEvents.pop()
    }

    // Handle different event types
    switch (payload.event) {
      case 'order.created':
      case 'order.updated':
      case 'order.status_changed':
        await handleOrderUpdate(payload)
        break

      case 'order.shipped':
        await handleOrderShipped(payload)
        break

      case 'order.delivered':
        await handleOrderDelivered(payload)
        break

      default:
        console.log(`[N1 Webhook] Unknown event: ${payload.event}`)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Helper functions to handle webhook events
async function handleOrderUpdate(payload: N1WebhookPayload) {
  const { orderId, externalRef, status, statusLabel, trackingCode, carrierName } = payload.data

  try {
    // Update N1Order in database if it exists
    const n1Order = await prisma.n1Order.findFirst({
      where: { n1OrderId: orderId },
    })

    if (n1Order) {
      await prisma.n1Order.update({
        where: { id: n1Order.id },
        data: {
          status: status as any,
          statusLabel,
          trackingCode,
          carrierName,
          lastSyncAt: new Date(),
        },
      })
    }

    // Update DOD Order if external ref matches
    if (externalRef) {
      const dodOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: externalRef },
            { shopifyId: externalRef },
            { shopifyOrderNumber: externalRef },
          ],
        },
      })

      if (dodOrder && trackingCode) {
        await prisma.order.update({
          where: { id: dodOrder.id },
          data: {
            trackingCode,
            carrierName,
          },
        })
      }
    }
  } catch (error) {
    console.error('Error handling order update:', error)
  }
}

async function handleOrderShipped(payload: N1WebhookPayload) {
  const { externalRef, trackingCode, carrierName } = payload.data

  try {
    if (externalRef) {
      const dodOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: externalRef },
            { shopifyId: externalRef },
            { shopifyOrderNumber: externalRef },
          ],
        },
      })

      if (dodOrder) {
        await prisma.order.update({
          where: { id: dodOrder.id },
          data: {
            status: 'SHIPPED',
            deliveryStatus: 'IN_TRANSIT',
            trackingCode,
            carrierName,
            shippedAt: new Date(),
          },
        })

        // Add status history
        await prisma.orderStatusHistory.create({
          data: {
            orderId: dodOrder.id,
            status: 'SHIPPED',
            notes: `Enviado via N1 Warehouse - ${carrierName || 'Transportadora'}`,
          },
        })
      }
    }
  } catch (error) {
    console.error('Error handling order shipped:', error)
  }
}

async function handleOrderDelivered(payload: N1WebhookPayload) {
  const { externalRef } = payload.data

  try {
    if (externalRef) {
      const dodOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: externalRef },
            { shopifyId: externalRef },
            { shopifyOrderNumber: externalRef },
          ],
        },
      })

      if (dodOrder) {
        await prisma.order.update({
          where: { id: dodOrder.id },
          data: {
            status: 'DELIVERED',
            deliveryStatus: 'DELIVERED',
            paymentStatus: 'PAID', // COD - payment received on delivery
            deliveredAt: new Date(),
          },
        })

        // Add status history
        await prisma.orderStatusHistory.create({
          data: {
            orderId: dodOrder.id,
            status: 'DELIVERED',
            notes: 'Entregue e pago (COD) - Confirmação N1 Warehouse',
          },
        })
      }
    }
  } catch (error) {
    console.error('Error handling order delivered:', error)
  }
}

// GET /api/n1/webhook - Get recent webhook events (for debugging/monitoring)
export async function GET() {
  return NextResponse.json({
    events: webhookEvents.slice(0, 20),
    total: webhookEvents.length,
  })
}
