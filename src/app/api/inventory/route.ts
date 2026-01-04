import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar itens de inventário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const lowStock = searchParams.get('lowStock') === 'true'
    const search = searchParams.get('search')

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const where: any = { workspaceId: membership.workspaceId }

    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    let items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
            salePrice: true,
            costPrice: true,
            isActive: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Filtrar por estoque baixo se solicitado
    if (lowStock) {
      items = items.filter(item => item.quantity <= item.minQuantity)
    }

    const total = await prisma.inventoryItem.count({ where })

    // Calcular estatísticas
    const stats = await prisma.inventoryItem.aggregate({
      where: { workspaceId: membership.workspaceId },
      _sum: { quantity: true },
      _count: true,
    })

    const lowStockCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM inventory_items
      WHERE "workspaceId" = ${membership.workspaceId}
      AND quantity <= "minQuantity"
    ` as any[]

    return NextResponse.json({
      data: items,
      stats: {
        totalItems: stats._count,
        totalQuantity: stats._sum.quantity || 0,
        lowStockItems: parseInt(lowStockCount[0]?.count || '0'),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar inventário:', error)
    return NextResponse.json({ error: 'Erro ao buscar inventário' }, { status: 500 })
  }
}

// POST - Criar/Atualizar item de inventário
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    if (!body.productId) {
      return NextResponse.json({ error: 'Produto é obrigatório' }, { status: 400 })
    }

    // Verificar se o produto existe
    const product = await prisma.product.findFirst({
      where: { id: body.productId, workspaceId: membership.workspaceId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Upsert - criar ou atualizar
    const item = await prisma.inventoryItem.upsert({
      where: {
        workspaceId_productId: {
          workspaceId: membership.workspaceId,
          productId: body.productId,
        },
      },
      update: {
        quantity: body.quantity ?? 0,
        minQuantity: body.minQuantity ?? 10,
        location: body.location,
        lastRestockAt: body.quantity > 0 ? new Date() : undefined,
      },
      create: {
        workspaceId: membership.workspaceId,
        productId: body.productId,
        quantity: body.quantity ?? 0,
        minQuantity: body.minQuantity ?? 10,
        location: body.location,
        lastRestockAt: body.quantity > 0 ? new Date() : null,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar/atualizar inventário:', error)
    return NextResponse.json({ error: 'Erro ao processar inventário' }, { status: 500 })
  }
}
