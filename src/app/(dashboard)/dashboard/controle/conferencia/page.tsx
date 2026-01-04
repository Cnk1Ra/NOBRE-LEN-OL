'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Truck,
  Search,
  Filter,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

// Deliveries to check - starts empty, will be populated from API
const deliveriesToCheck: Array<{
  id: string
  order: string
  customer: string
  status: 'pending' | 'checked' | 'issue'
  courier: string
  trackingCode: string
}> = []

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando', color: 'bg-yellow-500/10 text-yellow-500' },
  checked: { label: 'Conferido', color: 'bg-green-500/10 text-green-500' },
  issue: { label: 'Com Problema', color: 'bg-red-500/10 text-red-500' },
}

export default function ConferenciaControlPage() {
  const stats = {
    pending: deliveriesToCheck.filter(d => d.status === 'pending').length,
    checked: deliveriesToCheck.filter(d => d.status === 'checked').length,
    issues: deliveriesToCheck.filter(d => d.status === 'issue').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Conferência de Entregas</h1>
              <p className="text-sm text-muted-foreground">
                Verifique e confirme entregas realizadas
              </p>
            </div>
          </div>
        </div>
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
                <p className="text-xs text-muted-foreground">Aguardando conferência</p>
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
                <p className="text-2xl font-bold">{stats.checked}</p>
                <p className="text-xs text-muted-foreground">Conferidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.issues}</p>
                <p className="text-xs text-muted-foreground">Com problemas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por pedido ou rastreio..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>

      {/* Deliveries List */}
      <div className="grid gap-4">
        {deliveriesToCheck.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Nenhuma entrega para conferir</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Quando houver entregas pendentes de conferência, elas aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          deliveriesToCheck.map((delivery) => (
            <Card key={delivery.id} className={delivery.status === 'issue' ? 'border-red-500/20' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{delivery.order}</p>
                        <Badge className={statusMap[delivery.status].color}>
                          {statusMap[delivery.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{delivery.customer}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Truck className="h-3 w-3" />
                        <span>{delivery.courier}</span>
                        <span>•</span>
                        <span className="font-mono">{delivery.trackingCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {delivery.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Problema
                        </Button>
                        <Button size="sm">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                      </>
                    )}
                    {delivery.status === 'issue' && (
                      <Button variant="outline" size="sm">
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
