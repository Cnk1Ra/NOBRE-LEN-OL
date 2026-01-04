import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar parceiro por ID
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

    const partner = await prisma.partner.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
      include: {
        distributions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    return NextResponse.json(partner)
  } catch (error) {
    console.error('Erro ao buscar parceiro:', error)
    return NextResponse.json({ error: 'Erro ao buscar parceiro' }, { status: 500 })
  }
}

// PATCH - Atualizar parceiro
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

    const existingPartner = await prisma.partner.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existingPartner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const updateData: any = {}

    const fields = ['name', 'email', 'phone', 'type', 'profitPercentage', 'investedAmount', 'notes', 'isActive']
    fields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field]
    })

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(partner)
  } catch (error) {
    console.error('Erro ao atualizar parceiro:', error)
    return NextResponse.json({ error: 'Erro ao atualizar parceiro' }, { status: 500 })
  }
}

// DELETE - Excluir parceiro
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

    if (!['OWNER', 'MATRIX'].includes(user?.role || '') &&
        !['OWNER'].includes(membership.role || '')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const existingPartner = await prisma.partner.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existingPartner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    // Soft delete
    await prisma.partner.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Parceiro desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir parceiro:', error)
    return NextResponse.json({ error: 'Erro ao excluir parceiro' }, { status: 500 })
  }
}
