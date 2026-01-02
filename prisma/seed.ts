import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar conta MATRIX (super admin)
  const matrixPassword = await bcrypt.hash('Matrix@2024!Secure', 12)
  
  const matrixUser = await prisma.user.upsert({
    where: { email: 'matrix@dashondelivery.com' },
    update: {},
    create: {
      name: 'Matrix Admin',
      email: 'matrix@dashondelivery.com',
      password: matrixPassword,
      role: 'MATRIX',
    },
  })

  console.log('✅ Conta MATRIX criada:', matrixUser.email)
  console.log('📧 Email: matrix@dashondelivery.com')
  console.log('🔑 Senha: Matrix@2024!Secure')
  console.log('')
  console.log('⚠️  IMPORTANTE: Mude a senha após o primeiro login!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
