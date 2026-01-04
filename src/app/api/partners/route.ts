import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar parceiros
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const type = searchParams.get('type')

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const where: any = { workspaceId: membership.workspaceId }
    if (isActive !== null) where.isActive = isActive === 'true'
    if (type) where.type = type

    const partners = await prisma.partner.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    // Calcular total de porcentagem
    const totalPercentage = partners
      .filter(p => p.isActive)
      .reduce((sum, p) => sum + p.profitPercentage, 0)

    return NextResponse.json({
      data: partners,
      stats: {
        totalPartners: partners.length,
        activePartners: partners.filter(p => p.isActive).length,
        totalPercentage,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error)
    return NextResponse.json({ error: 'Erro ao buscar parceiros' }, { status: 500 })
  }
}

// POST - Criar parceiro
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

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

    // Apenas OWNER, ADMIN ou MATRIX podem criar parceiros
    if (!['OWNER', 'ADMIN', 'MATRIX'].includes(user?.role || '') &&
        !['OWNER', 'ADMIN'].includes(membership.role || '')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    if (!body.type) {
      return NextResponse.json({ error: 'Tipo é obrigatório' }, { status: 400 })
    }

    if (body.profitPercentage === undefined) {
      return NextResponse.json({ error: 'Porcentagem de lucro é obrigatória' }, { status: 400 })
    }

    const partner = await prisma.partner.create({
      data: {
        workspaceId: membership.workspaceId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        type: body.type,
        profitPercentage: body.profitPercentage,
        investedAmount: body.investedAmount,
        notes: body.notes,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar parceiro:', error)
    return NextResponse.json({ error: 'Erro ao criar parceiro' }, { status: 500 })
  }
}
