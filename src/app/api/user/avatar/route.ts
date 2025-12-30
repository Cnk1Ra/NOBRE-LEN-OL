import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/user/avatar - Upload/atualizar avatar
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { avatar } = body

    // Validate avatar (base64 string or URL)
    if (avatar && typeof avatar === 'string') {
      // Check if it's a base64 image
      if (avatar.startsWith('data:image/')) {
        // Limit size to ~3MB (base64 is ~33% larger than original)
        if (avatar.length > 4 * 1024 * 1024) {
          return NextResponse.json(
            { message: 'Imagem muito grande. Máximo 3MB.' },
            { status: 400 }
          )
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: avatar || null,
      },
      select: {
        id: true,
        image: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: avatar ? 'Avatar atualizado com sucesso' : 'Avatar removido com sucesso',
      avatar: updatedUser.image,
      updatedAt: updatedUser.updatedAt,
    })
  } catch (error) {
    console.error('Error updating avatar:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/avatar - Remover avatar
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: null,
      }
    })

    return NextResponse.json({
      message: 'Avatar removido com sucesso',
    })
  } catch (error) {
    console.error('Error removing avatar:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
