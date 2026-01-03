import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET - Listar webhooks
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

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId é obrigatório', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      )
    }

    const webhooks = await prisma.webhookConfig.findMany({
      where: { workspaceId },
      include: {
        logs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mascarar secrets
    const webhooksWithStats = webhooks.map((webhook: any) => ({
      ...webhook,
      secret: webhook.secret ? '••••••••' : null,
      totalRequests: webhook._count.logs,
      successRate: webhook._count.logs > 0
        ? Math.round((webhook.logs.filter((l: any) => l.status === 'SUCCESS').length / webhook._count.logs) * 100)
        : 0,
    }))

    return NextResponse.json({ webhooks: webhooksWithStats })
  } catch (error: any) {
    console.error('Erro ao buscar webhooks:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar webhooks',
        code: 'FETCH_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST - Criar webhook
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
    const { workspaceId, name, url, events, generateSecret } = body

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId é obrigatório', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      )
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do webhook é obrigatório', code: 'MISSING_NAME' },
        { status: 400 }
      )
    }

    if (!url || url.trim() === '') {
      return NextResponse.json(
        { error: 'URL do webhook é obrigatória', code: 'MISSING_URL' },
        { status: 400 }
      )
    }

    // Validar URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'URL inválida', code: 'INVALID_URL' },
        { status: 400 }
      )
    }

    // Gerar secret se solicitado
    const secret = generateSecret ? crypto.randomBytes(32).toString('hex') : null

    const webhook = await prisma.webhookConfig.create({
      data: {
        workspaceId,
        name: name.trim(),
        url: url.trim(),
        events: events || ['PageView', 'Purchase', 'Lead', 'InitiateCheckout'],
        secret,
        isActive: true,
      },
    })

    return NextResponse.json(
      {
        webhook: {
          ...webhook,
          secretVisible: secret, // Mostrar secret apenas na criação
        },
        message: 'Webhook criado com sucesso'
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar webhook:', error)
    return NextResponse.json(
      {
        error: 'Erro ao criar webhook',
        code: 'CREATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar webhook
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
    const { id, name, url, events, isActive, regenerateSecret } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório', code: 'MISSING_ID' },
        { status: 400 }
      )
    }

    const existingWebhook = await prisma.webhookConfig.findUnique({
      where: { id },
    })

    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook não encontrado', code: 'WEBHOOK_NOT_FOUND' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (url !== undefined) {
      try {
        new URL(url)
        updateData.url = url.trim()
      } catch {
        return NextResponse.json(
          { error: 'URL inválida', code: 'INVALID_URL' },
          { status: 400 }
        )
      }
    }
    if (events !== undefined) updateData.events = events
    if (isActive !== undefined) updateData.isActive = isActive
    if (regenerateSecret) {
      updateData.secret = crypto.randomBytes(32).toString('hex')
    }

    const webhook = await prisma.webhookConfig.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      webhook: {
        ...webhook,
        secret: webhook.secret ? '••••••••' : null,
        secretVisible: regenerateSecret ? webhook.secret : undefined,
      },
      message: 'Webhook atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar webhook:', error)
    return NextResponse.json(
      {
        error: 'Erro ao atualizar webhook',
        code: 'UPDATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE - Excluir webhook
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
        { error: 'ID é obrigatório', code: 'MISSING_ID' },
        { status: 400 }
      )
    }

    const existingWebhook = await prisma.webhookConfig.findUnique({
      where: { id },
    })

    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook não encontrado', code: 'WEBHOOK_NOT_FOUND' },
        { status: 404 }
      )
    }

    await prisma.webhookConfig.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Webhook excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir webhook:', error)
    return NextResponse.json(
      {
        error: 'Erro ao excluir webhook',
        code: 'DELETE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}
