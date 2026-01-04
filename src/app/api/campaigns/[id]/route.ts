import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar campanha por ID com métricas
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

    const campaign = await prisma.campaign.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
      include: {
        trackingEvents: {
          take: 100,
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    }

    // Calcular métricas
    const events = campaign.trackingEvents
    const impressions = events.filter(e => e.eventType === 'PAGE_VIEW').length
    const clicks = events.filter(e => e.eventType === 'CLICK').length
    const conversions = events.filter(e => e.eventType === 'PURCHASE').length
    const revenue = events
      .filter(e => e.eventType === 'PURCHASE')
      .reduce((sum, e) => sum + (e.eventValue || 0), 0)

    const metrics = {
      impressions,
      clicks,
      conversions,
      revenue,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? campaign.spent / clicks : 0,
      cpa: conversions > 0 ? campaign.spent / conversions : 0,
      roas: campaign.spent > 0 ? revenue / campaign.spent : 0,
    }

    return NextResponse.json({
      ...campaign,
      metrics,
    })
  } catch (error) {
    console.error('Erro ao buscar campanha:', error)
    return NextResponse.json({ error: 'Erro ao buscar campanha' }, { status: 500 })
  }
}

// PATCH - Atualizar campanha
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

    const existing = await prisma.campaign.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const updateData: any = {}

    const fields = ['name', 'platform', 'externalId', 'status', 'budget', 'spent']
    fields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field]
    })

    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null
    }

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Erro ao atualizar campanha:', error)
    return NextResponse.json({ error: 'Erro ao atualizar campanha' }, { status: 500 })
  }
}

// DELETE - Excluir campanha
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

    const existing = await prisma.campaign.findFirst({
      where: { id: params.id, workspaceId: membership.workspaceId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    }

    // Arquivar em vez de deletar
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ message: 'Campanha arquivada com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir campanha:', error)
    return NextResponse.json({ error: 'Erro ao excluir campanha' }, { status: 500 })
  }
}
