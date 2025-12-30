import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar usuário Matrix (Super Admin)
  const matrixEmail = 'matrix@admin.com'
  const matrixPassword = 'matrix123' // Troque depois!

  const existingMatrix = await prisma.user.findUnique({
    where: { email: matrixEmail }
  })

  if (existingMatrix) {
    console.log('⚠️  Usuário Matrix já existe:', matrixEmail)

    // Atualizar para MATRIX se não for
    if (existingMatrix.role !== 'MATRIX') {
      await prisma.user.update({
        where: { email: matrixEmail },
        data: { role: 'MATRIX' }
      })
      console.log('✅ Usuário atualizado para role MATRIX')
    }
  } else {
    const hashedPassword = await bcrypt.hash(matrixPassword, 12)

    await prisma.user.create({
      data: {
        name: 'Matrix Admin',
        email: matrixEmail,
        password: hashedPassword,
        role: 'MATRIX',
      }
    })

    console.log('✅ Usuário Matrix criado!')
    console.log('📧 Email:', matrixEmail)
    console.log('🔑 Senha:', matrixPassword)
    console.log('⚠️  TROQUE A SENHA APÓS O PRIMEIRO LOGIN!')
  }

  console.log('🌱 Seed concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
