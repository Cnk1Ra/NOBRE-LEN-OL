import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar pedido por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { workspaceId: true },
    })

    if (!user?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        workspaceId: user.workspaceId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        country: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 })
  }
}

// PATCH - Atualizar pedido
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { workspaceId: true },
    })

    if (!user?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se o pedido existe e pertence ao workspace
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        workspaceId: user.workspaceId,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const body = await request.json()

    // Preparar dados para atualização
    const updateData: any = {}

    // Campos atualizáveis
    const fields = [
      'customerName', 'customerEmail', 'customerPhone',
      'shippingAddress', 'shippingCity', 'shippingState', 'shippingZip', 'shippingCountry',
      'subtotal', 'shippingCost', 'discount', 'total', 'costOfGoods',
      'status', 'paymentStatus', 'deliveryStatus',
      'trackingCode', 'carrierName', 'countryId',
      'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm',
      'referrer', 'landingPage', 'notes',
    ]

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Atualizar datas com base no status
    if (body.status === 'SHIPPED' && !existingOrder.shippedAt) {
      updateData.shippedAt = new Date()
    }
    if (body.status === 'DELIVERED' && !existingOrder.deliveredAt) {
      updateData.deliveredAt = new Date()
      updateData.paymentStatus = 'PAID'
    }
    if (body.status === 'RETURNED' && !existingOrder.returnedAt) {
      updateData.returnedAt = new Date()
    }
    if (body.status === 'CANCELLED' && !existingOrder.cancelledAt) {
      updateData.cancelledAt = new Date()
    }

    // Recalcular lucro se valores foram atualizados
    if (updateData.subtotal !== undefined || updateData.costOfGoods !== undefined ||
        updateData.shippingCost !== undefined || updateData.discount !== undefined) {
      const subtotal = updateData.subtotal ?? existingOrder.subtotal
      const costOfGoods = updateData.costOfGoods ?? existingOrder.costOfGoods
      const shippingCost = updateData.shippingCost ?? existingOrder.shippingCost
      const discount = updateData.discount ?? existingOrder.discount
      updateData.profit = subtotal - costOfGoods - shippingCost + discount
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: true,
        country: true,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}

// DELETE - Excluir pedido
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { workspaceId: true, role: true },
    })

    if (!user?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Apenas OWNER, ADMIN ou MATRIX podem deletar
    if (!['OWNER', 'ADMIN', 'MATRIX'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Sem permissão para deletar pedidos' }, { status: 403 })
    }

    // Verificar se o pedido existe e pertence ao workspace
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        workspaceId: user.workspaceId,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Deletar pedido (cascade deleta os items)
    await prisma.order.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Pedido excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir pedido:', error)
    return NextResponse.json({ error: 'Erro ao excluir pedido' }, { status: 500 })
  }
}
