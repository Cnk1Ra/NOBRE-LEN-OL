import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers para permitir requisições de qualquer origem (landing pages)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Workspace-ID',
}

// OPTIONS - Preflight CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET - Health check e informações
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspaceId')

  if (workspaceId) {
    try {
      // Retorna estatísticas do workspace
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [totalEvents, eventsToday, lastEvent] = await Promise.all([
        prisma.incomingTrackingEvent.count({
          where: { workspaceId },
        }),
        prisma.incomingTrackingEvent.count({
          where: { workspaceId, createdAt: { gte: today } },
        }),
        prisma.incomingTrackingEvent.findFirst({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      return NextResponse.json({
        status: 'active',
        workspaceId,
        stats: {
          totalEvents,
          eventsToday,
          lastEventAt: lastEvent?.createdAt || null,
        },
      }, { headers: corsHeaders })
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Erro ao buscar estatísticas',
      }, { status: 500, headers: corsHeaders })
    }
  }

  return NextResponse.json({
    status: 'active',
    message: 'DOD Tracking Webhook - Pronto para receber eventos',
    endpoints: {
      POST: '/api/webhook/tracking - Enviar evento de tracking',
      GET: '/api/webhook/tracking?workspaceId=xxx - Ver estatísticas',
    },
    supportedEvents: ['PageView', 'InitiateCheckout', 'Purchase', 'Lead', 'AddToCart', 'Custom'],
  }, { headers: corsHeaders })
}

// POST - Receber evento de tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extrair dados do evento
    const {
      event,
      timestamp,
      tracking,
      data,
      page,
      workspaceId,
    } = body

    if (!event) {
      return NextResponse.json(
        { error: 'Campo "event" é obrigatório', code: 'MISSING_EVENT' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Extrair visitor_id do tracking ou gerar um
    const visitorId = tracking?.visitor_id || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Extrair informações da requisição
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || 'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Salvar evento no banco
    const trackingEvent = await prisma.incomingTrackingEvent.create({
      data: {
        workspaceId: workspaceId || null,
        visitorId,
        sessionId: tracking?.session_id || null,
        eventName: event,
        eventData: data || null,

        // UTM Parameters
        utmSource: tracking?.utm_source || null,
        utmMedium: tracking?.utm_medium || null,
        utmCampaign: tracking?.utm_campaign || null,
        utmContent: tracking?.utm_content || null,
        utmTerm: tracking?.utm_term || null,

        // Click IDs
        fbclid: tracking?.fbclid || null,
        gclid: tracking?.gclid || null,
        ttclid: tracking?.ttclid || null,

        // Page info
        pageUrl: page?.url || null,
        pageTitle: page?.title || null,
        referrer: tracking?.referrer || null,
        landingPage: tracking?.landing_page || null,

        // Device/Location
        ipAddress,
        userAgent,
        country: data?.country || null,
        currency: data?.currency || null,

        // Order info (for Purchase events)
        orderId: data?.order_id || null,
        orderValue: data?.value ? parseFloat(data.value) : null,
      },
    })

    // Se workspaceId estiver configurado, tentar enviar para webhooks configurados
    if (workspaceId) {
      try {
        const webhooks = await prisma.webhookConfig.findMany({
          where: {
            workspaceId,
            isActive: true,
            events: { has: event },
          },
        })

        // Enviar para webhooks em background (não bloqueia a resposta)
        for (const webhook of webhooks) {
          sendToWebhook(webhook, body).catch(console.error)
        }
      } catch (err) {
        console.error('Erro ao buscar webhooks:', err)
      }
    }

    // Atualizar contadores dos pixels se configurados
    if (workspaceId) {
      try {
        const pixels = await prisma.pixel.findMany({
          where: { workspaceId, isActive: true },
        })

        for (const pixel of pixels) {
          // Criar registro de evento do pixel
          await prisma.pixelEvent.create({
            data: {
              pixelId: pixel.id,
              eventName: event,
              eventData: data || null,
              status: 'SUCCESS',
              processedAt: new Date(),
            },
          })

          // Atualizar contador
          await prisma.pixel.update({
            where: { id: pixel.id },
            data: {
              eventsToday: { increment: 1 },
              lastEventAt: new Date(),
            },
          })
        }
      } catch (err) {
        console.error('Erro ao atualizar pixels:', err)
      }
    }

    return NextResponse.json({
      success: true,
      eventId: trackingEvent.id,
      event,
      timestamp: trackingEvent.createdAt,
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Erro ao processar evento de tracking:', error)

    // Verificar se é erro de parsing JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'JSON inválido', code: 'INVALID_JSON' },
        { status: 400, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro ao processar evento',
        code: 'PROCESSING_ERROR',
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Função auxiliar para enviar para webhooks externos
async function sendToWebhook(webhook: any, payload: any) {
  const startTime = Date.now()

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Adicionar assinatura HMAC se secret configurado
    if (webhook.secret) {
      const crypto = require('crypto')
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex')
      headers['X-Webhook-Signature'] = signature
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const responseBody = await response.text()
    const duration = Date.now() - startTime

    // Registrar log
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        eventType: payload.event,
        payload,
        responseCode: response.status,
        responseBody: responseBody.substring(0, 1000), // Limitar tamanho
        status: response.ok ? 'SUCCESS' : 'FAILED',
        attempts: 1,
        processedAt: new Date(),
      },
    })

    // Atualizar webhook
    await prisma.webhookConfig.update({
      where: { id: webhook.id },
      data: {
        lastTriggeredAt: new Date(),
        failCount: response.ok ? 0 : { increment: 1 },
      },
    })

  } catch (error: any) {
    const duration = Date.now() - startTime

    // Registrar falha
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        eventType: payload.event,
        payload,
        status: 'FAILED',
        attempts: 1,
        errorMessage: error.message,
        processedAt: new Date(),
      },
    })

    // Incrementar contador de falhas
    await prisma.webhookConfig.update({
      where: { id: webhook.id },
      data: { failCount: { increment: 1 } },
    })
  }
}
