'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Mail, CheckCircle2, AlertTriangle, Copy, ExternalLink, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [userLanguage, setUserLanguage] = useState('pt-BR')

  // Detectar idioma do usuário
  useEffect(() => {
    const savedLang = localStorage.getItem('dod-language')
    if (savedLang) {
      setUserLanguage(savedLang)
    } else if (navigator.language) {
      setUserLanguage(navigator.language)
    }
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setErrorDetails(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: userLanguage }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        setEmailSent(data.sent === true)
        if (data.resetLink) {
          setResetLink(data.resetLink)
        }
      } else {
        // Mostrar erro na página em vez de apenas toast
        setErrorMessage(data.error || 'Erro ao processar solicitação')
        setErrorDetails(data.details || null)

        toast({
          title: 'Erro',
          description: data.error || 'Erro ao processar solicitação',
          variant: 'destructive',
        })
      }
    } catch (error) {
      setErrorMessage('Erro de conexão. Verifique sua internet.')
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar sua solicitação',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (resetLink) {
      navigator.clipboard.writeText(resetLink)
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      })
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${emailSent ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                {emailSent ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <Mail className="h-8 w-8" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {emailSent ? 'Email Enviado!' : 'Link Gerado'}
            </CardTitle>
            <CardDescription>
              {emailSent ? (
                <>
                  Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
                </>
              ) : (
                <>Use o link abaixo para redefinir sua senha</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailSent && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Verifique sua caixa de entrada
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      O email pode levar alguns minutos para chegar. Verifique também a pasta de spam.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {resetLink && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Link de redefinição:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 px-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 px-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      <Link href={resetLink} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <code className="text-xs text-blue-700 dark:text-blue-300 break-all block bg-blue-100 dark:bg-blue-900/50 p-2 rounded border border-blue-200 dark:border-blue-700">
                  {resetLink}
                </code>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href={resetLink}>
                    Redefinir Senha Agora
                  </Link>
                </Button>
              </div>
            )}

            {!emailSent && !resetLink && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Verifique seu email
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Se o email existir em nosso sistema, você receberá as instruções.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Mail className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Digite seu email e enviaremos instruções para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {errorMessage}
                  </p>
                  {errorDetails && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errorDetails}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar instruções
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
