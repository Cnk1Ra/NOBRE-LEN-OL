import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getPasswordResetEmailTemplate, getPasswordResetTextTemplate, getPasswordResetSubject } from '@/lib/email/templates'
import crypto from 'crypto'

// Mapeamento de expiresIn por idioma
const expiresInByLang: Record<string, string> = {
  'pt-BR': '1 hora',
  'pt-PT': '1 hora',
  'en-US': '1 hour',
  'en-GB': '1 hour',
  'es': '1 hora',
  'fr': '1 heure',
  'de': '1 Stunde',
  'it': '1 ora',
}

function getExpiresIn(lang: string): string {
  return expiresInByLang[lang] || expiresInByLang['pt-BR']
}

export async function POST(request: Request) {
  try {
    const { email, language } = await request.json()

    // Detectar idioma do header Accept-Language como fallback
    const acceptLanguage = request.headers.get('Accept-Language')
    const detectedLang = language || acceptLanguage?.split(',')[0]?.split(';')[0] || 'pt-BR'

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })
    } catch (dbError: unknown) {
      console.error('Erro ao conectar ao banco:', dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error'
      return NextResponse.json({
        error: 'Erro ao conectar ao banco de dados. Verifique se o banco está configurado.',
        details: errorMessage,
      }, { status: 500 })
    }

    // Sempre retornamos sucesso para não revelar se o email existe
    if (!user) {
      return NextResponse.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
        sent: true,
      })
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex')

    // Token expira em 1 hora
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Tentar salvar token no banco
    try {
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

      // Salvar novo token no banco
      await prisma.passwordResetToken.create({
        data: {
          email: email.toLowerCase(),
          token,
          expires,
        },
      })
    } catch (tokenError: unknown) {
      console.error('Erro ao criar token:', tokenError)
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error'

      // Se a tabela não existe, informar
      if (errorMessage.includes('does not exist') || errorMessage.includes('P2021')) {
        return NextResponse.json({
          error: 'Tabela de tokens não encontrada. Execute: npx prisma db push',
          details: 'A migração do banco de dados precisa ser executada.',
          needsMigration: true,
        }, { status: 500 })
      }

      return NextResponse.json({
        error: 'Erro ao processar solicitação',
        details: errorMessage,
      }, { status: 500 })
    }

    // Construir link de redefinição
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // Verificar se SMTP está configurado
    const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD)

    if (smtpConfigured) {
      // Enviar email no idioma correto
      const expiresIn = getExpiresIn(detectedLang)

      try {
        await sendEmail({
          to: user.email,
          subject: getPasswordResetSubject(detectedLang),
          html: getPasswordResetEmailTemplate({
            userName: user.name || undefined,
            resetLink,
            expiresIn,
            language: detectedLang,
          }),
          text: getPasswordResetTextTemplate({
            userName: user.name || undefined,
            resetLink,
            expiresIn,
            language: detectedLang,
          }),
        })

        return NextResponse.json({
          message: 'Email de redefinição enviado com sucesso!',
          sent: true,
        })
      } catch (emailError: unknown) {
        console.error('Erro ao enviar email:', emailError)
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
        // Em caso de erro no envio, retornamos o link
        return NextResponse.json({
          message: 'Erro ao enviar email, mas você pode usar o link abaixo.',
          sent: false,
          resetLink,
          emailError: errorMessage,
        })
      }
    } else {
      // SMTP não configurado - retornar link diretamente
      console.warn('SMTP não configurado. Retornando link diretamente.')
      return NextResponse.json({
        message: 'Use o link abaixo para redefinir sua senha.',
        sent: false,
        resetLink,
        smtpNotConfigured: true,
        warning: 'Configure SMTP_HOST, SMTP_USER e SMTP_PASSWORD no .env para enviar emails automaticamente.',
      })
    }
  } catch (error: unknown) {
    console.error('Erro ao processar forgot-password:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Erro ao processar solicitação', details: errorMessage },
      { status: 500 }
    )
  }
}
