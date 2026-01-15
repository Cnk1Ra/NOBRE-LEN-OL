import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Atualizar quantidade de inventário (ajuste rápido)
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

    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const updateData: any = {}

    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.minQuantity !== undefined) updateData.minQuantity = body.minQuantity
    if (body.location !== undefined) updateData.location = body.location

    // Se aumentou quantidade, atualizar data de restock
    if (body.quantity && body.quantity > existingItem.quantity) {
      updateData.lastRestockAt = new Date()
    }

    // Registrar movimento se houver alteração de quantidade
    if (body.quantity !== undefined && body.quantity !== existingItem.quantity) {
      const diff = body.quantity - existingItem.quantity
      await prisma.inventoryMovement.create({
        data: {
          inventoryItemId: params.id,
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          reason: body.reason || (diff > 0 ? 'Reposição manual' : 'Ajuste manual'),
        },
      })
    }

    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: updateData,
      include: { product: true },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao atualizar inventário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar inventário' }, { status: 500 })
  }
}

// DELETE - Remover item de inventário
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

    if (!['OWNER', 'ADMIN', 'MATRIX'].includes(user?.role || '') &&
        !['OWNER', 'ADMIN'].includes(membership.role || '')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    await prisma.inventoryItem.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Item removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover inventário:', error)
    return NextResponse.json({ error: 'Erro ao remover inventário' }, { status: 500 })
  }
}
