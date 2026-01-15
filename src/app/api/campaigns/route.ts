import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar campanhas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const where: any = { workspaceId: membership.workspaceId }
    if (platform) where.platform = platform
    if (status) where.status = status

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ])

    // Calcular métricas agregadas
    const stats = await prisma.campaign.aggregate({
      where: { workspaceId: membership.workspaceId, status: 'ACTIVE' },
      _sum: { spent: true, budget: true },
      _count: true,
    })

    return NextResponse.json({
      data: campaigns,
      stats: {
        activeCampaigns: stats._count,
        totalSpent: stats._sum.spent || 0,
        totalBudget: stats._sum.budget || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error)
    return NextResponse.json({ error: 'Erro ao buscar campanhas' }, { status: 500 })
  }
}

// POST - Criar campanha
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

    if (!body.name || !body.platform) {
      return NextResponse.json({ error: 'Nome e plataforma são obrigatórios' }, { status: 400 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId: membership.workspaceId,
        name: body.name,
        platform: body.platform,
        externalId: body.externalId,
        status: body.status || 'ACTIVE',
        budget: body.budget,
        spent: body.spent || 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar campanha:', error)
    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 })
  }
}
