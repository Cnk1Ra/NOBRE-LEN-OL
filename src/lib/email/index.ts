import nodemailer from 'nodemailer'

// Configuração do transporter
const createTransporter = () => {
  // Para produção, use SMTP real (ex: Gmail, SendGrid, AWS SES, etc.)
  // Para desenvolvimento, pode usar Ethereal ou Mailtrap

  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  }

  return nodemailer.createTransport(config)
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const transporter = createTransporter()

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Dash On Delivery'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Fallback para texto simples
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    throw error
  }
}

// Verificar configuração do email
export async function verifyEmailConfig() {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return { configured: true }
  } catch (error) {
    console.error('Configuração de email inválida:', error)
    return { configured: false, error }
  }
}
