import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/profile - Buscar perfil do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        workspaceMembers: {
          select: {
            role: true,
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Parse name into firstName and lastName
    const nameParts = (user.name || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    return NextResponse.json({
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      avatar: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      workspaces: user.workspaceMembers.map(wm => ({
        id: wm.workspace.id,
        name: wm.workspace.name,
        slug: wm.workspace.slug,
        role: wm.role,
      }))
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Atualizar perfil do usuário
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, phone } = body

    if (!firstName || firstName.trim() === '') {
      return NextResponse.json(
        { message: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const fullName = lastName
      ? `${firstName.trim()} ${lastName.trim()}`
      : firstName.trim()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        updatedAt: true,
      }
    })

    const nameParts = (updatedUser.name || '').split(' ')
    const updatedFirstName = nameParts[0] || ''
    const updatedLastName = nameParts.slice(1).join(' ') || ''

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        firstName: updatedFirstName,
        lastName: updatedLastName,
        email: updatedUser.email,
        phone: phone || '',
        avatar: updatedUser.image,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
