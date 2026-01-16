import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar contas do Facebook
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Construir filtros
    const where: any = {
      workspaceId: membership.workspaceId,
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const accounts = await prisma.facebookAdAccount.findMany({
      where,
      orderBy: { accountName: 'asc' },
    })

    return NextResponse.json({ data: accounts })
  } catch (error) {
    console.error('Erro ao buscar contas:', error)
    return NextResponse.json({ error: 'Erro ao buscar contas' }, { status: 500 })
  }
}

// POST - Criar conta do Facebook
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Validar campos obrigatórios
    if (!body.accountId) {
      return NextResponse.json({ error: 'ID da conta é obrigatório' }, { status: 400 })
    }

    if (!body.accountName) {
      return NextResponse.json({ error: 'Nome da conta é obrigatório' }, { status: 400 })
    }

    // Verificar se já existe
    const existing = await prisma.facebookAdAccount.findUnique({
      where: {
        workspaceId_accountId: {
          workspaceId: membership.workspaceId,
          accountId: body.accountId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Conta já cadastrada' }, { status: 400 })
    }

    const account = await prisma.facebookAdAccount.create({
      data: {
        workspaceId: membership.workspaceId,
        accountId: body.accountId,
        accountName: body.accountName,
        currency: body.currency || 'USD',
        timezone: body.timezone || 'America/Los_Angeles',
        accessToken: body.accessToken,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta:', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}

// PUT - Atualizar conta do Facebook
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se a conta pertence ao workspace
    const existing = await prisma.facebookAdAccount.findFirst({
      where: { id: body.id, workspaceId: membership.workspaceId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }

    const account = await prisma.facebookAdAccount.update({
      where: { id: body.id },
      data: {
        accountId: body.accountId,
        accountName: body.accountName,
        currency: body.currency,
        timezone: body.timezone,
        accessToken: body.accessToken,
        isActive: body.isActive,
        lastSyncAt: body.lastSyncAt ? new Date(body.lastSyncAt) : undefined,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Erro ao atualizar conta:', error)
    return NextResponse.json({ error: 'Erro ao atualizar conta' }, { status: 500 })
  }
}

// DELETE - Remover conta do Facebook
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se a conta pertence ao workspace
    const account = await prisma.facebookAdAccount.findFirst({
      where: { id, workspaceId: membership.workspaceId },
    })

    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }

    await prisma.facebookAdAccount.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover conta:', error)
    return NextResponse.json({ error: 'Erro ao remover conta' }, { status: 500 })
  }
}
