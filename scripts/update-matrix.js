const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'matrix@dashondelivery.com' },
    data: { isPaymentExempt: true }
  });
  console.log('✅ MATRIX atualizado - isPaymentExempt:', user.isPaymentExempt);
}

main().finally(() => prisma.$disconnect());
