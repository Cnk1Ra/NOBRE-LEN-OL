import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar produtos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

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

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Buscar produtos com paginação e estoque
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          inventory: {
            select: {
              quantity: true,
              minQuantity: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Mapear com informações de estoque
    const productsWithStock = products.map(product => ({
      ...product,
      stockQuantity: product.inventory.reduce((sum, inv) => sum + inv.quantity, 0),
      minQuantity: product.inventory[0]?.minQuantity || 0,
      lowStock: product.inventory.some(inv => inv.quantity <= inv.minQuantity),
    }))

    return NextResponse.json({
      data: productsWithStock,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

// POST - Criar produto
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
    if (!body.name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    if (!body.sku) {
      return NextResponse.json({ error: 'SKU é obrigatório' }, { status: 400 })
    }

    if (body.costPrice === undefined || body.salePrice === undefined) {
      return NextResponse.json({ error: 'Preços são obrigatórios' }, { status: 400 })
    }

    // Verificar se SKU já existe no workspace
    const existingSku = await prisma.product.findFirst({
      where: {
        workspaceId: user.workspaceId,
        sku: body.sku,
      },
    })

    if (existingSku) {
      return NextResponse.json({ error: 'SKU já existe neste workspace' }, { status: 400 })
    }

    // Criar produto
    const product = await prisma.product.create({
      data: {
        workspaceId: user.workspaceId,
        sku: body.sku,
        name: body.name,
        description: body.description,
        costPrice: body.costPrice,
        salePrice: body.salePrice,
        weight: body.weight,
        imageUrl: body.imageUrl,
        isActive: body.isActive ?? true,
        shopifyId: body.shopifyId,
      },
    })

    // Criar item de inventário se quantidade inicial foi fornecida
    if (body.initialStock && body.initialStock > 0) {
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          workspaceId: user.workspaceId,
          quantity: body.initialStock,
          minQuantity: body.minQuantity || 10,
          location: body.location || 'Principal',
        },
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
