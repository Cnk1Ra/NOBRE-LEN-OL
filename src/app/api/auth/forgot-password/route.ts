import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getPasswordResetEmailTemplate, getPasswordResetTextTemplate } from '@/lib/email/templates'
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
        sent: true,
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

    // Construir link de redefinição
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // Verificar se SMTP está configurado
    const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD)

    if (smtpConfigured) {
      // Enviar email
      try {
        await sendEmail({
          to: user.email,
          subject: 'Redefinição de Senha - Dash On Delivery',
          html: getPasswordResetEmailTemplate({
            userName: user.name || undefined,
            resetLink,
            expiresIn: '1 hora',
          }),
          text: getPasswordResetTextTemplate({
            userName: user.name || undefined,
            resetLink,
            expiresIn: '1 hora',
          }),
        })

        return NextResponse.json({
          message: 'Email de redefinição enviado com sucesso!',
          sent: true,
        })
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError)
        // Em caso de erro no envio, ainda retornamos o link em dev
        const isDev = process.env.NODE_ENV === 'development'
        return NextResponse.json({
          message: 'Erro ao enviar email. Tente novamente mais tarde.',
          sent: false,
          ...(isDev && { resetLink, error: 'SMTP error - link mostrado apenas em desenvolvimento' }),
        })
      }
    } else {
      // SMTP não configurado - retornar link diretamente (desenvolvimento)
      console.warn('SMTP não configurado. Retornando link diretamente.')
      return NextResponse.json({
        message: 'SMTP não configurado. Configure as variáveis de ambiente para enviar emails.',
        sent: false,
        resetLink, // Mostrar link quando SMTP não está configurado
        warning: 'Configure SMTP_HOST, SMTP_USER e SMTP_PASSWORD no .env para enviar emails',
      })
    }
  } catch (error) {
    console.error('Erro ao processar forgot-password:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
