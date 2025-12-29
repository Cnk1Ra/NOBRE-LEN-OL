import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Detalhes do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é Matrix
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'MATRIX') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        workspaces: {
          include: {
            workspace: {
              include: {
                _count: {
                  select: {
                    orders: true,
                    products: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            activities: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH - Atualizar usuário
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é Matrix
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'MATRIX') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, password } = body

    const updateData: any = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role

    if (password) {
      const bcrypt = await import('bcryptjs')
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é Matrix
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'MATRIX') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Não permitir excluir a si mesmo
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Não é possível excluir sua própria conta' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
