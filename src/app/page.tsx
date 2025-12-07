import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redireciona para o dashboard
  // Em produção, verificar se o usuário está logado
  redirect('/dashboard')
}
