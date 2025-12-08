'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Truck,
  RefreshCw,
} from 'lucide-react'

const divergences = [
  {
    id: 'DIV-001',
    order: 'DOD-032',
    type: 'valor',
    description: 'Valor cobrado diferente do valor da venda',
    dodValue: 289.90,
    actualValue: 259.90,
    status: 'pending',
    date: '2024-12-07',
  },
  {
    id: 'DIV-002',
    order: 'DOD-028',
    type: 'entrega',
    description: 'Entrega confirmada mas cliente não recebeu',
    status: 'investigating',
    date: '2024-12-06',
  },
  {
    id: 'DIV-003',
    order: 'DOD-025',
    type: 'produto',
    description: 'Produto enviado diferente do pedido',
    status: 'resolved',
    date: '2024-12-05',
  },
  {
    id: 'DIV-004',
    order: 'DOD-020',
    type: 'duplicado',
    description: 'Pedido duplicado no sistema',
    status: 'pending',
    date: '2024-12-07',
  },
]

const typeMap: Record<string, { label: string; color: string; icon: any }> = {
  valor: { label: 'Valor', color: 'bg-yellow-500/10 text-yellow-500', icon: DollarSign },
  entrega: { label: 'Entrega', color: 'bg-blue-500/10 text-blue-500', icon: Truck },
  produto: { label: 'Produto', color: 'bg-purple-500/10 text-purple-500', icon: Package },
  duplicado: { label: 'Duplicado', color: 'bg-orange-500/10 text-orange-500', icon: GitCompare },
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  investigating: { label: 'Investigando', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  resolved: { label: 'Resolvido', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
}

export default function DivergenciasControlPage() {
  const stats = {
    pending: divergences.filter(d => d.status === 'pending').length,
    investigating: divergences.filter(d => d.status === 'investigating').length,
    resolved: divergences.filter(d => d.status === 'resolved').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <GitCompare className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Divergências</h1>
              <p className="text-sm text-muted-foreground">
                Pedidos com problemas ou inconsistências
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.investigating}</p>
                <p className="text-xs text-muted-foreground">Em investigação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Divergences List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Divergências</CardTitle>
          <CardDescription>Pedidos que precisam de atenção</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {divergences.map((div) => {
            const type = typeMap[div.type]
            const TypeIcon = type.icon
            return (
              <div
                key={div.id}
                className="flex items-start justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${type.color}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{div.order}</span>
                      <Badge className={type.color}>{type.label}</Badge>
                      <Badge variant="outline" className={statusMap[div.status].color}>
                        {statusMap[div.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{div.description}</p>
                    {div.dodValue && div.actualValue && (
                      <p className="text-sm mt-2">
                        <span className="text-muted-foreground">DOD:</span>{' '}
                        <span className="font-medium">R$ {div.dodValue.toFixed(2)}</span>
                        <span className="text-muted-foreground mx-2">→</span>
                        <span className="text-muted-foreground">Real:</span>{' '}
                        <span className="font-medium text-red-500">R$ {div.actualValue.toFixed(2)}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{div.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {div.status !== 'resolved' && (
                    <>
                      <Button variant="outline" size="sm">Investigar</Button>
                      <Button size="sm">Resolver</Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
