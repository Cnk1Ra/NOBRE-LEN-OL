import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Set NEXTAUTH_SECRET if not defined (required for production)
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'dod-dashboard-secret-key-2024-production-fallback'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
