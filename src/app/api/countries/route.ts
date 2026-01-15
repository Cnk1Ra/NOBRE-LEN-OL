import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar países
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const where: any = { workspaceId: membership.workspaceId }
    if (isActive !== null) where.isActive = isActive === 'true'

    const countries = await prisma.country.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: countries })
  } catch (error) {
    console.error('Erro ao buscar países:', error)
    return NextResponse.json({ error: 'Erro ao buscar países' }, { status: 500 })
  }
}

// POST - Criar país
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

    if (!body.code || !body.name || !body.currency || !body.currencySymbol) {
      return NextResponse.json({ error: 'Campos obrigatórios: code, name, currency, currencySymbol' }, { status: 400 })
    }

    // Verificar se código já existe
    const existing = await prisma.country.findFirst({
      where: { workspaceId: membership.workspaceId, code: body.code },
    })

    if (existing) {
      return NextResponse.json({ error: 'País já cadastrado' }, { status: 400 })
    }

    const country = await prisma.country.create({
      data: {
        workspaceId: membership.workspaceId,
        code: body.code.toUpperCase(),
        name: body.name,
        currency: body.currency.toUpperCase(),
        currencySymbol: body.currencySymbol,
        exchangeRate: body.exchangeRate || 1,
        shippingCost: body.shippingCost || 0,
        deliveryDays: body.deliveryDays || 7,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(country, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar país:', error)
    return NextResponse.json({ error: 'Erro ao criar país' }, { status: 500 })
  }
}
