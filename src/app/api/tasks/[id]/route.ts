import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar tarefa por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        workspaceId: membership.workspaceId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao buscar tarefa' }, { status: 500 })
  }
}

// PATCH - Atualizar tarefa
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se a tarefa existe e pertence ao workspace
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        workspaceId: membership.workspaceId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    const body = await request.json()

    // Preparar dados para atualização
    const updateData: any = {}

    const fields = [
      'title', 'description', 'priority', 'status',
      'category', 'assigneeId', 'relatedOrderId',
    ]

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }

    // Atualizar completedAt quando status muda para DONE
    if (body.status === 'DONE' && existingTask.status !== 'DONE') {
      updateData.completedAt = new Date()
    } else if (body.status && body.status !== 'DONE') {
      updateData.completedAt = null
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

// DELETE - Excluir tarefa
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se a tarefa existe e pertence ao workspace
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        workspaceId: membership.workspaceId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Deletar tarefa (cascade deleta os comentários)
    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Tarefa excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error)
    return NextResponse.json({ error: 'Erro ao excluir tarefa' }, { status: 500 })
  }
}
