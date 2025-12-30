import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Sempre retornamos sucesso para não revelar se o email existe
    if (!user) {
      return NextResponse.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      })
    }

    // Invalidar tokens anteriores do mesmo email
    await prisma.passwordResetToken.updateMany({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
      data: {
        used: true,
      },
    })

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex')

    // Token expira em 1 hora
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Salvar token no banco
    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      },
    })

    // Em produção, enviaríamos um email aqui
    // Por enquanto, retornamos o link diretamente (apenas para desenvolvimento)
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    // Em produção, não retornar o resetLink
    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      ...(isDev && { resetLink }),
    })
  } catch (error) {
    console.error('Erro ao processar forgot-password:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
