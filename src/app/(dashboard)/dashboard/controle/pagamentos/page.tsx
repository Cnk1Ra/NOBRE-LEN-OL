'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Building,
  Users,
} from 'lucide-react'

// Payments - starts empty, will be populated from API
const payments: Array<{
  id: string
  supplier: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'scheduled'
  dueDate: string
  paidDate: string | null
}> = []

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  paid: { label: 'Pago', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  overdue: { label: 'Atrasado', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertTriangle },
  scheduled: { label: 'Agendado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Calendar },
}

export default function PagamentosControlPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const stats = {
    paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    scheduled: payments.filter(p => p.status === 'scheduled').reduce((sum, p) => sum + p.amount, 0),
  }

  const filteredPayments = payments.filter(p =>
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Controle de Pagamentos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie pagamentos a fornecedores e despesas
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.paid)}</p>
                <p className="text-xs text-muted-foreground">Pagos este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.pending)}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.overdue)}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.scheduled)}</p>
                <p className="text-xs text-muted-foreground">Agendados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por fornecedor ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <CardDescription>Todos os pagamentos do mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum pagamento cadastrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => {
                  const status = statusMap[payment.status]
                  const StatusIcon = status.icon
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.supplier}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.paidDate || '-'}</TableCell>
                      <TableCell className="text-right">
                        {payment.status !== 'paid' && (
                          <Button variant="outline" size="sm">
                            Pagar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
