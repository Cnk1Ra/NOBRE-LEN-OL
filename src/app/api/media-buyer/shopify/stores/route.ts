import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateShopifyCredentials } from '@/lib/shopify-api'

// GET - Listar lojas Shopify do workspace
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const stores = await prisma.shopifyStore.findMany({
      where: { workspaceId: membership.workspaceId },
      select: {
        id: true,
        storeUrl: true,
        storeName: true,
        currency: true,
        timezone: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: stores })
  } catch (error) {
    console.error('Erro ao listar lojas Shopify:', error)
    return NextResponse.json({ error: 'Erro ao listar lojas' }, { status: 500 })
  }
}

// POST - Adicionar nova loja Shopify
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { storeUrl, storeName, accessToken, currency, timezone } = body

    // Validar campos obrigatórios
    if (!storeUrl || !storeName || !accessToken) {
      return NextResponse.json({
        error: 'Campos obrigatórios: storeUrl, storeName, accessToken'
      }, { status: 400 })
    }

    // Limpar URL da loja
    const cleanStoreUrl = storeUrl
      .replace('https://', '')
      .replace('http://', '')
      .replace(/\/$/, '')

    // Validar credenciais antes de salvar
    const validation = await validateShopifyCredentials(cleanStoreUrl, accessToken)
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error || 'Credenciais inválidas',
        message: 'Verifique a URL da loja e o access token'
      }, { status: 400 })
    }

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se loja já existe
    const existingStore = await prisma.shopifyStore.findFirst({
      where: {
        workspaceId: membership.workspaceId,
        storeUrl: cleanStoreUrl,
      },
    })

    if (existingStore) {
      return NextResponse.json({
        error: 'Esta loja já está cadastrada'
      }, { status: 400 })
    }

    // Criar loja
    const store = await prisma.shopifyStore.create({
      data: {
        workspaceId: membership.workspaceId,
        storeUrl: cleanStoreUrl,
        storeName: validation.shopName || storeName,
        accessToken,
        currency: currency || 'BRL',
        timezone: timezone || 'America/Sao_Paulo',
        isActive: true,
      },
    })

    return NextResponse.json({
      data: {
        id: store.id,
        storeUrl: store.storeUrl,
        storeName: store.storeName,
        currency: store.currency,
        timezone: store.timezone,
        isActive: store.isActive,
      },
      message: 'Loja conectada com sucesso!',
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar loja Shopify:', error)
    return NextResponse.json({ error: 'Erro ao adicionar loja' }, { status: 500 })
  }
}

// PUT - Atualizar loja Shopify
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, storeUrl, storeName, accessToken, currency, timezone, isActive } = body

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

    // Verificar se a loja pertence ao workspace
    const existingStore = await prisma.shopifyStore.findFirst({
      where: { id, workspaceId: membership.workspaceId },
    })

    if (!existingStore) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData: any = {}

    if (storeUrl) {
      updateData.storeUrl = storeUrl.replace('https://', '').replace('http://', '').replace(/\/$/, '')
    }
    if (storeName) updateData.storeName = storeName
    if (currency) updateData.currency = currency
    if (timezone) updateData.timezone = timezone
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    // Se forneceu novo token, validar antes de salvar
    if (accessToken) {
      const urlToValidate = updateData.storeUrl || existingStore.storeUrl
      const validation = await validateShopifyCredentials(urlToValidate, accessToken)
      if (!validation.valid) {
        return NextResponse.json({
          error: validation.error || 'Access token inválido'
        }, { status: 400 })
      }
      updateData.accessToken = accessToken
    }

    // Atualizar loja
    const store = await prisma.shopifyStore.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      data: {
        id: store.id,
        storeUrl: store.storeUrl,
        storeName: store.storeName,
        currency: store.currency,
        timezone: store.timezone,
        isActive: store.isActive,
      },
      message: 'Loja atualizada com sucesso!',
    })
  } catch (error) {
    console.error('Erro ao atualizar loja Shopify:', error)
    return NextResponse.json({ error: 'Erro ao atualizar loja' }, { status: 500 })
  }
}

// DELETE - Remover loja Shopify
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

    // Verificar se a loja pertence ao workspace
    const store = await prisma.shopifyStore.findFirst({
      where: { id, workspaceId: membership.workspaceId },
    })

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Remover loja (cascata remove pedidos também)
    await prisma.shopifyStore.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Loja removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover loja Shopify:', error)
    return NextResponse.json({ error: 'Erro ao remover loja' }, { status: 500 })
  }
}
