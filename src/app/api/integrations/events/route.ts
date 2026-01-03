import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar eventos de tracking recentes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const eventName = searchParams.get('eventName')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (workspaceId) {
      where.workspaceId = workspaceId
    }

    if (eventName) {
      where.eventName = eventName
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [events, total] = await Promise.all([
      prisma.incomingTrackingEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 100),
        skip: offset,
      }),
      prisma.incomingTrackingEvent.count({ where }),
    ])

    // Estatísticas
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const statsWhere = workspaceId ? { workspaceId } : {}

    const [
      totalEvents,
      eventsToday,
      pageViews,
      purchases,
      leads,
      initiateCheckouts,
    ] = await Promise.all([
      prisma.incomingTrackingEvent.count({ where: statsWhere }),
      prisma.incomingTrackingEvent.count({
        where: { ...statsWhere, createdAt: { gte: today } },
      }),
      prisma.incomingTrackingEvent.count({
        where: { ...statsWhere, eventName: 'PageView' },
      }),
      prisma.incomingTrackingEvent.count({
        where: { ...statsWhere, eventName: 'Purchase' },
      }),
      prisma.incomingTrackingEvent.count({
        where: { ...statsWhere, eventName: 'Lead' },
      }),
      prisma.incomingTrackingEvent.count({
        where: { ...statsWhere, eventName: 'InitiateCheckout' },
      }),
    ])

    // Calcular receita total de purchases
    const purchaseEvents = await prisma.incomingTrackingEvent.findMany({
      where: { ...statsWhere, eventName: 'Purchase', orderValue: { not: null } },
      select: { orderValue: true },
    })
    const totalRevenue = purchaseEvents.reduce((sum: number, e: any) => sum + (e.orderValue || 0), 0)

    return NextResponse.json({
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + events.length < total,
      },
      stats: {
        totalEvents,
        eventsToday,
        byType: {
          pageViews,
          purchases,
          leads,
          initiateCheckouts,
        },
        totalRevenue,
      },
    })
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar eventos',
        code: 'FETCH_ERROR',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE - Limpar eventos antigos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId é obrigatório', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      )
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await prisma.incomingTrackingEvent.deleteMany({
      where: {
        workspaceId,
        createdAt: { lt: cutoffDate },
      },
    })

    return NextResponse.json({
      message: `${result.count} eventos removidos com sucesso`,
      deletedCount: result.count,
    })
  } catch (error: any) {
    console.error('Erro ao limpar eventos:', error)
    return NextResponse.json(
      {
        error: 'Erro ao limpar eventos',
        code: 'DELETE_ERROR',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
