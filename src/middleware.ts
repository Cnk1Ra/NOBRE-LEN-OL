import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Verificar se o usuário está autenticado
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar acesso ao painel admin (apenas MATRIX)
    if (pathname.startsWith('/dashboard/admin')) {
      if (token.role !== 'MATRIX') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Proteger todas as rotas do dashboard e APIs protegidas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/orders/:path*',
    '/api/products/:path*',
    '/api/tasks/:path*',
    '/api/inventory/:path*',
    '/api/financial/:path*',
    '/api/partners/:path*',
    '/api/campaigns/:path*',
    '/api/admin/:path*',
  ],
}
