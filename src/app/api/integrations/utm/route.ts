import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar configurações de UTM
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

    const utmConfigs = await prisma.uTMConfiguration.findMany({
      where: { workspaceId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ utmConfigs })
  } catch (error: any) {
    console.error('Erro ao buscar configurações UTM:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar configurações UTM',
        code: 'FETCH_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST - Criar configuração de UTM
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
      name,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      isDefault,
    } = body

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId é obrigatório', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      )
    }

    // Se esta config será padrão, remover padrão das outras
    if (isDefault) {
      await prisma.uTMConfiguration.updateMany({
        where: { workspaceId },
        data: { isDefault: false },
      })
    }

    const utmConfig = await prisma.uTMConfiguration.create({
      data: {
        workspaceId,
        name: name?.trim() || 'Nova Configuração',
        utmSource: utmSource || '{platform}',
        utmMedium: utmMedium || 'cpc',
        utmCampaign: utmCampaign || '{campaign_name}',
        utmContent: utmContent || '{ad_name}',
        utmTerm: utmTerm || '{adset_name}',
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(
      { utmConfig, message: 'Configuração UTM criada com sucesso' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar configuração UTM:', error)
    return NextResponse.json(
      {
        error: 'Erro ao criar configuração UTM',
        code: 'CREATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar configuração de UTM
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
    const {
      id,
      name,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      isDefault,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório', code: 'MISSING_ID' },
        { status: 400 }
      )
    }

    const existingConfig = await prisma.uTMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuração não encontrada', code: 'CONFIG_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Se esta config será padrão, remover padrão das outras
    if (isDefault) {
      await prisma.uTMConfiguration.updateMany({
        where: { workspaceId: existingConfig.workspaceId, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (utmSource !== undefined) updateData.utmSource = utmSource
    if (utmMedium !== undefined) updateData.utmMedium = utmMedium
    if (utmCampaign !== undefined) updateData.utmCampaign = utmCampaign
    if (utmContent !== undefined) updateData.utmContent = utmContent
    if (utmTerm !== undefined) updateData.utmTerm = utmTerm
    if (isDefault !== undefined) updateData.isDefault = isDefault

    const utmConfig = await prisma.uTMConfiguration.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ utmConfig, message: 'Configuração UTM atualizada com sucesso' })
  } catch (error: any) {
    console.error('Erro ao atualizar configuração UTM:', error)
    return NextResponse.json(
      {
        error: 'Erro ao atualizar configuração UTM',
        code: 'UPDATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE - Excluir configuração de UTM
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

    const existingConfig = await prisma.uTMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuração não encontrada', code: 'CONFIG_NOT_FOUND' },
        { status: 404 }
      )
    }

    await prisma.uTMConfiguration.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Configuração UTM excluída com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir configuração UTM:', error)
    return NextResponse.json(
      {
        error: 'Erro ao excluir configuração UTM',
        code: 'DELETE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}
