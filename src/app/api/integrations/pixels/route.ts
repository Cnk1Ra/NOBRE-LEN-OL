import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type PixelPlatform = 'META' | 'GOOGLE' | 'TIKTOK'

// GET - Listar todos os pixels do workspace
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
    const platform = searchParams.get('platform') as PixelPlatform | null

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

    const pixels = await prisma.pixel.findMany({
      where,
      include: {
        events: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { events: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calcular eventos de hoje para cada pixel
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const pixelsWithStats = await Promise.all(
      pixels.map(async (pixel: any) => {
        const eventsToday = await prisma.pixelEvent.count({
          where: {
            pixelId: pixel.id,
            createdAt: { gte: today },
          },
        })

        const lastEvent = await prisma.pixelEvent.findFirst({
          where: { pixelId: pixel.id },
          orderBy: { createdAt: 'desc' },
        })

        return {
          ...pixel,
          eventsToday,
          lastEventAt: lastEvent?.createdAt || null,
          totalEvents: pixel._count.events,
        }
      })
    )

    return NextResponse.json({ pixels: pixelsWithStats })
  } catch (error: any) {
    console.error('Erro ao buscar pixels:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar pixels',
        code: 'FETCH_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST - Criar novo pixel
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
    const { workspaceId, platform, pixelId, name, accessToken, testEventCode } = body

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

    if (!pixelId || pixelId.trim() === '') {
      return NextResponse.json(
        { error: 'ID do Pixel é obrigatório', code: 'MISSING_PIXEL_ID' },
        { status: 400 }
      )
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do Pixel é obrigatório', code: 'MISSING_NAME' },
        { status: 400 }
      )
    }

    // Verificar se pixel já existe
    const existingPixel = await prisma.pixel.findFirst({
      where: {
        workspaceId,
        platform: platform as PixelPlatform,
        pixelId: pixelId.trim(),
      },
    })

    if (existingPixel) {
      return NextResponse.json(
        { error: 'Este pixel já está cadastrado', code: 'PIXEL_EXISTS' },
        { status: 409 }
      )
    }

    // Validar formato do pixel ID por plataforma
    if (platform === 'META' && !/^\d{15,16}$/.test(pixelId.trim())) {
      return NextResponse.json(
        { error: 'ID do Meta Pixel deve ter 15-16 dígitos', code: 'INVALID_META_PIXEL_ID' },
        { status: 400 }
      )
    }

    if (platform === 'GOOGLE' && !/^(AW-|G-|GT-|UA-)\d+(-\d+)?$/.test(pixelId.trim())) {
      return NextResponse.json(
        { error: 'ID do Google Tag deve começar com AW-, G-, GT- ou UA-', code: 'INVALID_GOOGLE_TAG_ID' },
        { status: 400 }
      )
    }

    if (platform === 'TIKTOK' && !/^C[A-Z0-9]{10,20}$/.test(pixelId.trim())) {
      return NextResponse.json(
        { error: 'ID do TikTok Pixel deve começar com C e ter 11-21 caracteres', code: 'INVALID_TIKTOK_PIXEL_ID' },
        { status: 400 }
      )
    }

    const pixel = await prisma.pixel.create({
      data: {
        workspaceId,
        platform: platform as PixelPlatform,
        pixelId: pixelId.trim(),
        name: name.trim(),
        accessToken: accessToken?.trim() || null,
        testEventCode: testEventCode?.trim() || null,
        isActive: true,
      },
    })

    return NextResponse.json({ pixel, message: 'Pixel criado com sucesso' }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar pixel:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este pixel já está cadastrado', code: 'PIXEL_EXISTS' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro ao criar pixel',
        code: 'CREATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar pixel
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
    const { id, name, accessToken, testEventCode, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do pixel é obrigatório', code: 'MISSING_ID' },
        { status: 400 }
      )
    }

    const existingPixel = await prisma.pixel.findUnique({
      where: { id },
    })

    if (!existingPixel) {
      return NextResponse.json(
        { error: 'Pixel não encontrado', code: 'PIXEL_NOT_FOUND' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (accessToken !== undefined) updateData.accessToken = accessToken?.trim() || null
    if (testEventCode !== undefined) updateData.testEventCode = testEventCode?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive

    const pixel = await prisma.pixel.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ pixel, message: 'Pixel atualizado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao atualizar pixel:', error)
    return NextResponse.json(
      {
        error: 'Erro ao atualizar pixel',
        code: 'UPDATE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE - Excluir pixel
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
        { error: 'ID do pixel é obrigatório', code: 'MISSING_ID' },
        { status: 400 }
      )
    }

    const existingPixel = await prisma.pixel.findUnique({
      where: { id },
    })

    if (!existingPixel) {
      return NextResponse.json(
        { error: 'Pixel não encontrado', code: 'PIXEL_NOT_FOUND' },
        { status: 404 }
      )
    }

    await prisma.pixel.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Pixel excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir pixel:', error)
    return NextResponse.json(
      {
        error: 'Erro ao excluir pixel',
        code: 'DELETE_ERROR',
        details: error.message
      },
      { status: 500 }
    )
  }
}
