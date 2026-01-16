import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getOrdersByDateRange,
  processOrder,
  groupOrdersByDate,
  generateDailySummary,
} from '@/lib/shopify-api'

// POST - Sincronizar pedidos da Shopify
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { storeId, startDate, endDate } = body

    // Validar campos obrigatórios
    if (!storeId || !startDate || !endDate) {
      return NextResponse.json({
        error: 'Campos obrigatórios: storeId, startDate, endDate'
      }, { status: 400 })
    }

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Buscar loja com token
    const store = await prisma.shopifyStore.findFirst({
      where: { id: storeId, workspaceId: membership.workspaceId },
    })

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    if (!store.accessToken) {
      return NextResponse.json({
        error: 'Token de acesso não configurado',
        message: 'Configure o access token da loja Shopify'
      }, { status: 400 })
    }

    // Buscar pedidos da Shopify
    console.log(`[Shopify Sync] Buscando pedidos de ${startDate} a ${endDate}...`)

    let shopifyOrders
    try {
      shopifyOrders = await getOrdersByDateRange(
        store.storeUrl,
        store.accessToken,
        startDate,
        endDate,
        '-03:00' // Timezone de São Paulo
      )
    } catch (error: any) {
      console.error('[Shopify Sync] Erro ao buscar pedidos:', error)
      return NextResponse.json({
        error: 'Erro ao conectar com Shopify',
        message: error.message || 'Verifique as credenciais da loja'
      }, { status: 400 })
    }

    console.log(`[Shopify Sync] Encontrados ${shopifyOrders.length} pedidos`)

    // Processar pedidos
    const processedOrders = shopifyOrders.map(processOrder)

    // Salvar pedidos no banco
    let ordersCreated = 0
    let ordersUpdated = 0

    for (const order of processedOrders) {
      try {
        await prisma.shopifyOrder.upsert({
          where: {
            workspaceId_shopifyOrderId: {
              workspaceId: membership.workspaceId,
              shopifyOrderId: BigInt(order.orderId),
            },
          },
          update: {
            financialStatus: order.financialStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            totalPrice: order.totalPrice,
            subtotalPrice: order.subtotalPrice,
            totalDiscounts: order.totalDiscounts,
            discountCode: order.discountCode,
            utmSource: order.utmSource,
            utmMedium: order.utmMedium,
            utmCampaign: order.utmCampaign,
            utmContent: order.utmContent,
            utmTerm: order.utmTerm,
            fbclid: order.fbclid,
            productNames: order.productNames,
            productSkus: order.productSkus,
            productQuantity: order.productQuantity,
            tags: order.tags,
            syncedAt: new Date(),
          },
          create: {
            workspaceId: membership.workspaceId,
            storeId: store.id,
            shopifyOrderId: BigInt(order.orderId),
            orderNumber: order.orderNumber,
            createdAt: new Date(order.createdAt),
            dateBrt: new Date(order.dateBrt),
            financialStatus: order.financialStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            totalPrice: order.totalPrice,
            subtotalPrice: order.subtotalPrice,
            totalDiscounts: order.totalDiscounts,
            currency: order.currency,
            discountCode: order.discountCode,
            utmSource: order.utmSource,
            utmMedium: order.utmMedium,
            utmCampaign: order.utmCampaign,
            utmContent: order.utmContent,
            utmTerm: order.utmTerm,
            fbclid: order.fbclid,
            gclid: null,
            referringSite: order.referringSite,
            sourceName: order.sourceName,
            productNames: order.productNames,
            productSkus: order.productSkus,
            productQuantity: order.productQuantity,
            tags: order.tags,
          },
        })
        ordersCreated++
      } catch (error) {
        console.error(`[Shopify Sync] Erro ao salvar pedido ${order.orderId}:`, error)
        ordersUpdated++ // Conta como update se deu erro de unique constraint
      }
    }

    // Agrupar por data para atualizar DailySales
    const ordersByDate = groupOrdersByDate(processedOrders)
    const dailySummaries = []

    for (const [dateStr, orders] of Object.entries(ordersByDate)) {
      const summary = generateDailySummary(orders)
      dailySummaries.push(summary)

      // Atualizar ou criar registro em DailySales
      try {
        await prisma.dailySales.upsert({
          where: {
            workspaceId_date_source: {
              workspaceId: membership.workspaceId,
              date: new Date(dateStr),
              source: 'shopify',
            },
          },
          update: {
            ordersCount: summary.totalOrders,
            grossRevenue: summary.grossRevenue,
            netRevenue: summary.netRevenue,
            averageTicket: summary.averageTicket,
          },
          create: {
            workspaceId: membership.workspaceId,
            date: new Date(dateStr),
            source: 'shopify',
            ordersCount: summary.totalOrders,
            grossRevenue: summary.grossRevenue,
            netRevenue: summary.netRevenue,
            averageTicket: summary.averageTicket,
          },
        })
      } catch (error) {
        console.error(`[Shopify Sync] Erro ao salvar DailySales para ${dateStr}:`, error)
      }
    }

    // Atualizar último sync da loja
    await prisma.shopifyStore.update({
      where: { id: store.id },
      data: { lastSyncAt: new Date() },
    })

    // Calcular totais para o período
    const totalOrders = processedOrders.length
    const totalRevenue = processedOrders.reduce((sum, o) => sum + o.totalPrice, 0)
    const facebookOrders = processedOrders.filter(o => o.utmSource === 'facebook').length
    const organicOrders = processedOrders.filter(o => !o.utmSource).length

    // Agrupar vendas por campanha (para retornar no response)
    const salesByCampaign: Record<string, { orders: number; revenue: number }> = {}
    for (const order of processedOrders) {
      const campaign = order.utmCampaign || 'Sem campanha'
      if (!salesByCampaign[campaign]) {
        salesByCampaign[campaign] = { orders: 0, revenue: 0 }
      }
      salesByCampaign[campaign].orders++
      salesByCampaign[campaign].revenue += order.totalPrice
    }

    return NextResponse.json({
      success: true,
      message: `${totalOrders} pedidos sincronizados com sucesso!`,
      data: {
        totalOrders,
        totalRevenue,
        ordersCreated,
        ordersUpdated,
        breakdown: {
          facebook: facebookOrders,
          organic: organicOrders,
          other: totalOrders - facebookOrders - organicOrders,
        },
        salesByCampaign,
        dailySummaries,
      },
    })
  } catch (error) {
    console.error('[Shopify Sync] Erro geral:', error)
    return NextResponse.json({ error: 'Erro ao sincronizar pedidos' }, { status: 500 })
  }
}

// GET - Buscar pedidos sincronizados do banco
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const storeId = searchParams.get('storeId')
    const campaign = searchParams.get('campaign')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Construir filtros
    const where: any = {
      workspaceId: membership.workspaceId,
    }

    if (startDate || endDate) {
      where.dateBrt = {}
      if (startDate) where.dateBrt.gte = new Date(startDate)
      if (endDate) where.dateBrt.lte = new Date(endDate)
    }

    if (storeId) where.storeId = storeId
    if (campaign) where.utmCampaign = campaign

    // Buscar pedidos
    const orders = await prisma.shopifyOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        dateBrt: true,
        financialStatus: true,
        fulfillmentStatus: true,
        totalPrice: true,
        totalDiscounts: true,
        currency: true,
        discountCode: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        productNames: true,
        productQuantity: true,
      },
    })

    // Calcular totais
    const totals = orders.reduce(
      (acc, order) => ({
        totalOrders: acc.totalOrders + 1,
        totalRevenue: acc.totalRevenue + order.totalPrice,
        totalDiscounts: acc.totalDiscounts + order.totalDiscounts,
      }),
      { totalOrders: 0, totalRevenue: 0, totalDiscounts: 0 }
    )

    return NextResponse.json({
      data: orders,
      totals,
    })
  } catch (error) {
    console.error('Erro ao buscar pedidos Shopify:', error)
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}
