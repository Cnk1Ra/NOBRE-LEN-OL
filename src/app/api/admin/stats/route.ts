import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Estatísticas globais (apenas Matrix)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é Matrix
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'MATRIX') {
      return NextResponse.json({ error: 'Acesso negado. Apenas usuários Matrix.' }, { status: 403 })
    }

    // Buscar estatísticas
    const [
      totalUsers,
      totalWorkspaces,
      totalOrders,
      totalProducts,
      usersByRole,
      recentUsers,
      recentWorkspaces,
      orderStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      }),
      prisma.workspace.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          createdAt: true,
          _count: {
            select: { members: true, orders: true }
          }
        }
      }),
      prisma.order.aggregate({
        _sum: { total: true, profit: true },
        _avg: { total: true },
      }),
    ])

    return NextResponse.json({
      totals: {
        users: totalUsers,
        workspaces: totalWorkspaces,
        orders: totalOrders,
        products: totalProducts,
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count
        return acc
      }, {} as Record<string, number>),
      financial: {
        totalRevenue: orderStats._sum.total || 0,
        totalProfit: orderStats._sum.profit || 0,
        avgOrderValue: orderStats._avg.total || 0,
      },
      recent: {
        users: recentUsers,
        workspaces: recentWorkspaces,
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
