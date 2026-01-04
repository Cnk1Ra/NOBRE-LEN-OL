import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar produto por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        workspaceId: membership.workspaceId,
      },
      include: {
        inventory: true,
        orderItems: {
          take: 10,
          orderBy: { order: { orderedAt: 'desc' } },
          include: {
            order: {
              select: {
                id: true,
                customerName: true,
                orderedAt: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      ...product,
      stockQuantity: product.inventory.reduce((sum, inv) => sum + inv.quantity, 0),
    })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 })
  }
}

// PATCH - Atualizar produto
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se o produto existe e pertence ao workspace
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        workspaceId: membership.workspaceId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const body = await request.json()

    // Verificar SKU duplicado se estiver sendo alterado
    if (body.sku && body.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          workspaceId: membership.workspaceId,
          sku: body.sku,
          id: { not: params.id },
        },
      })

      if (existingSku) {
        return NextResponse.json({ error: 'SKU já existe neste workspace' }, { status: 400 })
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}

    const fields = [
      'name', 'description', 'sku', 'costPrice', 'salePrice',
      'weight', 'imageUrl', 'isActive', 'shopifyId',
    ]

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        inventory: true,
      },
    })

    return NextResponse.json({
      ...product,
      stockQuantity: product.inventory.reduce((sum, inv) => sum + inv.quantity, 0),
    })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

// DELETE - Excluir produto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true, role: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Buscar role do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    // Apenas OWNER, ADMIN ou MATRIX podem deletar
    if (!['OWNER', 'ADMIN', 'MATRIX'].includes(user?.role || '') &&
        !['OWNER', 'ADMIN'].includes(membership.role || '')) {
      return NextResponse.json({ error: 'Sem permissão para deletar produtos' }, { status: 403 })
    }

    // Verificar se o produto existe e pertence ao workspace
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        workspaceId: membership.workspaceId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Soft delete - marcar como inativo em vez de deletar
    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Produto desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 })
  }
}
