import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AdPlatform = 'META' | 'GOOGLE' | 'TIKTOK'
type ConnectionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'ERROR' | 'DISCONNECTED'

// GET - Listar conexões de plataformas de ads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const platform = searchParams.get('platform') as AdPlatform | null

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId é obrigatório', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      )
    }

    const where: any = { workspaceId }
    if (platform) {
      where.platform = platform
    }

    const connections = await prisma.adPlatformConnection.findMany({
      where,
      include: {
        adAccounts: {
          orderBy: { accountName: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calcular totais de gastos por conexão
    const connectionsWithStats = connections.map((conn: any) => ({
      ...conn,
      totalSpend: conn.adAccounts.reduce((sum: number, acc: any) => sum + acc.spendTotal, 0),
      totalSpendToday: conn.adAccounts.reduce((sum: number, acc: any) => sum + acc.spendToday, 0),
      selectedAccounts: conn.adAccounts.filter((acc: any) => acc.isSelected).length,
      // Mascarar tokens sensíveis
      accessToken: conn.accessToken ? '••••••••' : null,
      refreshToken: conn.refreshToken ? '••••••••' : null,
    }))

    return NextResponse.json({ connections: connectionsWithStats })
  } catch (error: any) {
    console.error('Erro ao buscar conexões:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar conexões',
        code: 'FETCH_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST - Criar nova conexão (manual ou via OAuth callback)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      workspaceId,
      platform,
      name,
      email,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      businessId,
      businessName,
      adAccounts,
    } = body

    // Validações
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId é obrigatório', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      )
    }

    if (!platform || !['META', 'GOOGLE', 'TIKTOK'].includes(platform)) {
      return NextResponse.json(
        { error: 'Plataforma inválida. Use: META, GOOGLE ou TIKTOK', code: 'INVALID_PLATFORM' },
        { status: 400 }
      )
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da conexão é obrigatório', code: 'MISSING_NAME' },
        { status: 400 }
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso é obrigatório', code: 'MISSING_ACCESS_TOKEN' },
        { status: 400 }
      )
    }

    // Verificar se já existe conexão com mesmo businessId
    if (businessId) {
      const existingConnection = await prisma.adPlatformConnection.findFirst({
        where: {
          workspaceId,
          platform: platform as AdPlatform,
          businessId,
        },
      })

      if (existingConnection) {
        return NextResponse.json(
          { error: 'Esta conta já está conectada', code: 'CONNECTION_EXISTS' },
          { status: 409 }
        )
      }
    }

    // Criar conexão
    const connection = await prisma.adPlatformConnection.create({
      data: {
        workspaceId,
        platform: platform as AdPlatform,
        name: name.trim(),
        email: email?.trim() || null,
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
        businessId: businessId?.trim() || null,
        businessName: businessName?.trim() || null,
        status: 'ACTIVE' as ConnectionStatus,
        lastSyncAt: new Date(),
      },
    })

    // Criar contas de anúncios se fornecidas
    if (adAccounts && Array.isArray(adAccounts) && adAccounts.length > 0) {
      await prisma.adAccountLink.createMany({
        data: adAccounts.map((acc: any) => ({
          connectionId: connection.id,
          accountId: acc.accountId,
          accountName: acc.accountName || acc.name || 'Conta de Anúncios',
          currency: acc.currency || 'BRL',
          timezone: acc.timezone || 'America/Sao_Paulo',
          status: acc.status || 'active',
          isSelected: acc.isSelected !== false,
        })),
      })
    }

    const createdConnection = await prisma.adPlatformConnection.findUnique({
      where: { id: connection.id },
      include: { adAccounts: true },
    })

    return NextResponse.json(
      { connection: createdConnection, message: 'Conexão criada com sucesso' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar conexão:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Esta conexão já existe', code: 'CONNECTION_EXISTS' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro ao criar conexão',
        code: 'CREATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar conexão
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name, accessToken, refreshToken, tokenExpiresAt, status, adAccounts } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID da conexão é obrigatório', code: 'MISSING_ID' },
        { status: 400 }
      )
    }

    const existingConnection = await prisma.adPlatformConnection.findUnique({
      where: { id },
    })

    if (!existingConnection) {
      return NextResponse.json(
        { error: 'Conexão não encontrada', code: 'CONNECTION_NOT_FOUND' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (accessToken !== undefined) updateData.accessToken = accessToken
    if (refreshToken !== undefined) updateData.refreshToken = refreshToken
    if (tokenExpiresAt !== undefined) updateData.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : null
    if (status !== undefined) updateData.status = status

    const connection = await prisma.adPlatformConnection.update({
      where: { id },
      data: updateData,
    })

    // Atualizar seleção de contas de anúncios
    if (adAccounts && Array.isArray(adAccounts)) {
      for (const acc of adAccounts) {
        if (acc.id) {
          await prisma.adAccountLink.update({
            where: { id: acc.id },
            data: { isSelected: acc.isSelected },
          })
        }
      }
    }

    const updatedConnection = await prisma.adPlatformConnection.findUnique({
      where: { id },
      include: { adAccounts: true },
    })

    return NextResponse.json({ connection: updatedConnection, message: 'Conexão atualizada com sucesso' })
  } catch (error: any) {
    console.error('Erro ao atualizar conexão:', error)
    return NextResponse.json(
      {
        error: 'Erro ao atualizar conexão',
        code: 'UPDATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE - Excluir conexão
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID da conexão é obrigatório', code: 'MISSING_ID' },
        { status: 400 }
      )
    }

    const existingConnection = await prisma.adPlatformConnection.findUnique({
      where: { id },
    })

    if (!existingConnection) {
      return NextResponse.json(
        { error: 'Conexão não encontrada', code: 'CONNECTION_NOT_FOUND' },
        { status: 404 }
      )
    }

    await prisma.adPlatformConnection.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Conexão excluída com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir conexão:', error)
    return NextResponse.json(
      {
        error: 'Erro ao excluir conexão',
        code: 'DELETE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}
