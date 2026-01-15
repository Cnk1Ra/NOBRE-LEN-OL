import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar país por ID
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

    const country = await prisma.country.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
      include: {
        _count: { select: { orders: true } },
      },
    })

    if (!country) {
      return NextResponse.json({ error: 'País não encontrado' }, { status: 404 })
    }

    return NextResponse.json(country)
  } catch (error) {
    console.error('Erro ao buscar país:', error)
    return NextResponse.json({ error: 'Erro ao buscar país' }, { status: 500 })
  }
}

// PATCH - Atualizar país
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

    const existing = await prisma.country.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'País não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const updateData: any = {}

    const fields = ['name', 'currency', 'currencySymbol', 'exchangeRate', 'shippingCost', 'deliveryDays', 'isActive']
    fields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field]
    })

    const country = await prisma.country.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(country)
  } catch (error) {
    console.error('Erro ao atualizar país:', error)
    return NextResponse.json({ error: 'Erro ao atualizar país' }, { status: 500 })
  }
}

// DELETE - Excluir país
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

    const existing = await prisma.country.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'País não encontrado' }, { status: 404 })
    }

    // Soft delete
    await prisma.country.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'País desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir país:', error)
    return NextResponse.json({ error: 'Erro ao excluir país' }, { status: 500 })
  }
}
