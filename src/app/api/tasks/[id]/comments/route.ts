import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Adicionar comentário à tarefa
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { workspaceId: true },
    })

    if (!user?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se a tarefa existe e pertence ao workspace
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        workspaceId: user.workspaceId,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    const body = await request.json()

    if (!body.content) {
      return NextResponse.json({ error: 'Conteúdo é obrigatório' }, { status: 400 })
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: params.id,
        authorId: session.user.id,
        content: body.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    return NextResponse.json({ error: 'Erro ao criar comentário' }, { status: 500 })
  }
}
