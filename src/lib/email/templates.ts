interface PasswordResetEmailProps {
  userName?: string
  resetLink: string
  expiresIn?: string
}

export function getPasswordResetEmailTemplate({
  userName,
  resetLink,
  expiresIn = '1 hora',
}: PasswordResetEmailProps): string {
  const greeting = userName ? `Olá, ${userName}!` : 'Olá!'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Container Principal -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

          <!-- Header com Gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px 40px 50px 40px; text-align: center;">
              <!-- Logo -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <div style="width: 70px; height: 70px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; display: inline-block; line-height: 70px; backdrop-filter: blur(10px);">
                      <span style="font-size: 36px; font-weight: 700; color: #ffffff;">D</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Dash On Delivery
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ícone de Cadeado (sobrepondo o header) -->
          <tr>
            <td align="center" style="padding: 0;">
              <div style="width: 80px; height: 80px; background-color: #ffffff; border-radius: 50%; margin-top: -40px; display: inline-block; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1); position: relative;">
                <table role="presentation" style="width: 80px; height: 80px; border-collapse: collapse;">
                  <tr>
                    <td align="center" valign="middle">
                      <img src="https://img.icons8.com/fluency/48/lock-2.png" alt="Lock" style="width: 40px; height: 40px;" />
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 30px 40px 40px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <!-- Saudação -->
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <h2 style="margin: 0; font-size: 26px; font-weight: 700; color: #18181b; letter-spacing: -0.5px;">
                      Redefinição de Senha
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 25px;">
                    <p style="margin: 0; font-size: 16px; color: #71717a;">
                      ${greeting}
                    </p>
                  </td>
                </tr>

                <!-- Mensagem -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #3f3f46; text-align: center;">
                      Recebemos uma solicitação para redefinir a senha da sua conta.
                      Clique no botão abaixo para criar uma nova senha.
                    </p>
                  </td>
                </tr>

                <!-- Botão CTA -->
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                          <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                            Redefinir Minha Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Info Box -->
                <tr>
                  <td style="padding-bottom: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 12px; border: 1px solid #e4e4e7;">
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 36px; height: 36px; background-color: #fef3c7; border-radius: 8px; text-align: center; line-height: 36px;">
                                  <span style="font-size: 18px;">⏱️</span>
                                </div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #18181b;">
                                  Link expira em ${expiresIn}
                                </p>
                                <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.5;">
                                  Por questões de segurança, este link tem validade limitada.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Link alternativo -->
                <tr>
                  <td style="padding-bottom: 25px;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #71717a; text-align: center;">
                      Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                    </p>
                    <p style="margin: 0; font-size: 12px; word-break: break-all; background-color: #f4f4f5; padding: 12px; border-radius: 8px; color: #6366f1; text-align: center;">
                      ${resetLink}
                    </p>
                  </td>
                </tr>

                <!-- Aviso de Segurança -->
                <tr>
                  <td style="border-top: 1px solid #e4e4e7; padding-top: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 24px; vertical-align: top; padding-right: 10px;">
                          <span style="font-size: 16px;">🔒</span>
                        </td>
                        <td>
                          <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.6;">
                            <strong style="color: #3f3f46;">Não solicitou esta alteração?</strong><br>
                            Se você não solicitou a redefinição de senha, ignore este email.
                            Sua senha permanecerá inalterada.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px 40px; border-top: 1px solid #e4e4e7;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #18181b;">
                      Dash On Delivery
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                      Dashboard completo para operações de Cash on Delivery
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                      Este é um email automático. Por favor, não responda.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Copyright -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                © ${new Date().getFullYear()} Dash On Delivery. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Template de texto simples (fallback)
export function getPasswordResetTextTemplate({
  userName,
  resetLink,
  expiresIn = '1 hora',
}: PasswordResetEmailProps): string {
  const greeting = userName ? `Olá, ${userName}!` : 'Olá!'

  return `
${greeting}

REDEFINIÇÃO DE SENHA - Dash On Delivery
========================================

Recebemos uma solicitação para redefinir a senha da sua conta.

Para criar uma nova senha, acesse o link abaixo:
${resetLink}

IMPORTANTE:
- Este link expira em ${expiresIn}
- Se você não solicitou esta alteração, ignore este email

---
Dash On Delivery
Dashboard completo para operações de Cash on Delivery

Este é um email automático. Por favor, não responda.
© ${new Date().getFullYear()} Dash On Delivery. Todos os direitos reservados.
  `.trim()
}
