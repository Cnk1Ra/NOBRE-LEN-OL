import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar pedidos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const deliveryStatus = searchParams.get('deliveryStatus')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const countryId = searchParams.get('countryId')

    // Buscar workspace do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { workspaceId: true },
    })

    if (!user?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Construir filtros
    const where: any = {
      workspaceId: user.workspaceId,
    }

    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (deliveryStatus) where.deliveryStatus = deliveryStatus
    if (countryId) where.countryId = countryId

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { trackingCode: { contains: search, mode: 'insensitive' } },
        { shopifyOrderNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (startDate || endDate) {
      where.orderedAt = {}
      if (startDate) where.orderedAt.gte = new Date(startDate)
      if (endDate) where.orderedAt.lte = new Date(endDate)
    }

    // Buscar pedidos com paginação
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          country: true,
        },
        orderBy: { orderedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}

// POST - Criar pedido
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Buscar workspace do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { workspaceId: true },
    })

    if (!user?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Validar campos obrigatórios
    if (!body.customerName) {
      return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 })
    }

    if (!body.total && body.total !== 0) {
      return NextResponse.json({ error: 'Valor total é obrigatório' }, { status: 400 })
    }

    // Calcular lucro
    const subtotal = body.subtotal || body.total
    const costOfGoods = body.costOfGoods || 0
    const shippingCost = body.shippingCost || 0
    const discount = body.discount || 0
    const profit = subtotal - costOfGoods - shippingCost + discount

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        workspaceId: user.workspaceId,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingState: body.shippingState,
        shippingZip: body.shippingZip,
        shippingCountry: body.shippingCountry,
        subtotal,
        shippingCost,
        discount,
        total: body.total,
        costOfGoods,
        profit,
        status: body.status || 'PENDING',
        paymentStatus: body.paymentStatus || 'PENDING',
        deliveryStatus: body.deliveryStatus || 'PENDING',
        trackingCode: body.trackingCode,
        carrierName: body.carrierName,
        countryId: body.countryId,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmContent: body.utmContent,
        utmTerm: body.utmTerm,
        referrer: body.referrer,
        landingPage: body.landingPage,
        items: body.items ? {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            costPrice: item.costPrice || 0,
          })),
        } : undefined,
      },
      include: {
        items: true,
        country: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
