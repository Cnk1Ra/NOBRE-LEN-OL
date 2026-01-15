import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Sincronizar dados do Facebook (placeholder para integração futura)
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

    const accountId = body.accountId

    if (!accountId) {
      return NextResponse.json({ error: 'ID da conta é obrigatório' }, { status: 400 })
    }

    // Verificar se a conta existe e pertence ao workspace
    const account = await prisma.facebookAdAccount.findFirst({
      where: {
        id: accountId,
        workspaceId: membership.workspaceId,
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }

    // Verificar se tem token de acesso
    if (!account.accessToken) {
      return NextResponse.json({
        error: 'Token de acesso não configurado',
        message: 'Configure o token de acesso da conta para habilitar a sincronização automática.',
      }, { status: 400 })
    }

    // TODO: Implementar sincronização com API do Facebook
    // Por enquanto, apenas retornamos um placeholder

    // Atualizar lastSyncAt
    await prisma.facebookAdAccount.update({
      where: { id: accountId },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: 'Sincronização iniciada. Funcionalidade completa será implementada em breve.',
      accountId: account.accountId,
      accountName: account.accountName,
      lastSyncAt: new Date().toISOString(),
      // Placeholder para dados que serão retornados
      preview: {
        status: 'pending_implementation',
        description: 'A integração com a API do Facebook Ads será implementada para buscar automaticamente:',
        features: [
          'Gastos diários por campanha/adset',
          'Impressões, cliques e CTR',
          'Conversões e custo por resultado',
          'Alcance e frequência',
        ],
        requirements: [
          'Access Token válido',
          'Permissões: ads_read, ads_management',
          'Configuração do timezone da conta',
        ],
      },
    })
  } catch (error) {
    console.error('Erro ao sincronizar:', error)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}

// GET - Status da última sincronização
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Buscar contas
    const where: any = {
      workspaceId: membership.workspaceId,
    }

    if (accountId) {
      where.id = accountId
    }

    const accounts = await prisma.facebookAdAccount.findMany({
      where,
      select: {
        id: true,
        accountId: true,
        accountName: true,
        isActive: true,
        lastSyncAt: true,
        timezone: true,
        currency: true,
      },
      orderBy: { accountName: 'asc' },
    })

    // Adicionar status de sincronização
    const accountsWithStatus = accounts.map(account => {
      const hasToken = Boolean(account)
      const lastSync = account.lastSyncAt
      const needsSync = !lastSync || (new Date().getTime() - new Date(lastSync).getTime() > 3600000) // 1 hora

      return {
        ...account,
        syncStatus: {
          hasToken,
          lastSync,
          needsSync,
          status: !hasToken ? 'no_token' : needsSync ? 'needs_sync' : 'synced',
        },
      }
    })

    return NextResponse.json({ data: accountsWithStatus })
  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 })
  }
}
