import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, workspaceName } = body

    // Validações
    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário e workspace em uma transação
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
        },
      })

      // Gerar slug único para o workspace
      let slug = generateSlug(workspaceName)
      let slugExists = await tx.workspace.findUnique({ where: { slug } })
      let counter = 1
      while (slugExists) {
        slug = `${generateSlug(workspaceName)}-${counter}`
        slugExists = await tx.workspace.findUnique({ where: { slug } })
        counter++
      }

      // Criar workspace
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
        },
      })

      // Associar usuário ao workspace como OWNER
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'OWNER',
        },
      })

      // Criar países padrão para o workspace
      await tx.country.createMany({
        data: [
          {
            workspaceId: workspace.id,
            code: 'BR',
            name: 'Brasil',
            currency: 'BRL',
            currencySymbol: 'R$',
            exchangeRate: 1,
            shippingCost: 15,
            deliveryDays: 7,
          },
          {
            workspaceId: workspace.id,
            code: 'PT',
            name: 'Portugal',
            currency: 'EUR',
            currencySymbol: '€',
            exchangeRate: 0.18,
            shippingCost: 25,
            deliveryDays: 15,
          },
        ],
      })

      return { user, workspace }
    })

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        workspace: {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
