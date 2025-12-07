'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Plus,
  DollarSign,
  Percent,
  TrendingUp,
  Wallet,
  PieChart,
} from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils'
import type { Partner, PartnerType } from '@/types'

// Mock data
const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '+55 11 99999-1111',
    type: 'FOUNDER',
    profitPercentage: 40,
    isActive: true,
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '+55 11 99999-2222',
    type: 'PARTNER',
    profitPercentage: 30,
    isActive: true,
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '+55 11 99999-3333',
    type: 'INVESTOR',
    profitPercentage: 20,
    investedAmount: 50000,
    isActive: true,
    notes: 'Investidor anjo - rodada seed',
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@email.com',
    type: 'SILENT',
    profitPercentage: 10,
    investedAmount: 25000,
    isActive: true,
    notes: 'Sócia silenciosa - amiga da família',
  },
]

const partnerTypeLabels: Record<PartnerType, string> = {
  FOUNDER: 'Fundador',
  PARTNER: 'Sócio Operacional',
  INVESTOR: 'Investidor',
  SILENT: 'Sócio Silencioso',
}

const partnerTypeColors: Record<PartnerType, string> = {
  FOUNDER: 'bg-purple-500',
  PARTNER: 'bg-blue-500',
  INVESTOR: 'bg-green-500',
  SILENT: 'bg-gray-500',
}

export default function PartnersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Dados financeiros calculados
  const totalProfit = 43500 // Lucro líquido do período
  const totalDistributed = 43500 // Total a distribuir
  const pendingDistribution = 0

  // Calcular distribuição por sócio
  const partnerDistributions = mockPartners.map((partner) => ({
    ...partner,
    distribution: (totalProfit * partner.profitPercentage) / 100,
  }))

  // Verificar se a soma das porcentagens é 100%
  const totalPercentage = mockPartners.reduce(
    (sum, p) => sum + p.profitPercentage,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sócios</h1>
          <p className="text-muted-foreground">
            Gerencie sócios e distribuição de lucros
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Sócio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Sócio</DialogTitle>
              <DialogDescription>
                Adicione um novo sócio ou investidor ao seu negócio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Nome do sócio" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Sócio</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOUNDER">Fundador</SelectItem>
                    <SelectItem value="PARTNER">Sócio Operacional</SelectItem>
                    <SelectItem value="INVESTOR">Investidor</SelectItem>
                    <SelectItem value="SILENT">Sócio Silencioso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="percentage">Porcentagem do Lucro (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  placeholder="10"
                  min="0"
                  max="100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invested">Valor Investido (opcional)</Label>
                <Input
                  id="invested"
                  type="number"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockPartners.length}</p>
                <p className="text-xs text-muted-foreground">Total de Sócios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
                <p className="text-xs text-muted-foreground">Lucro do Período</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(75000)}</p>
                <p className="text-xs text-muted-foreground">Total Investido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <Percent className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPercentage}%</p>
                <p className={`text-xs ${totalPercentage === 100 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPercentage === 100 ? 'Distribuição Completa' : 'Verificar Porcentagens'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribuição do Período
          </CardTitle>
          <CardDescription>
            Lucro líquido: {formatCurrency(totalProfit)} - Dezembro 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {partnerDistributions.map((partner) => (
              <div key={partner.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={`${partnerTypeColors[partner.type]} text-white`}
                      >
                        {getInitials(partner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{partner.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {partnerTypeLabels[partner.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {partner.profitPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(partner.distribution)}
                    </p>
                    {partner.investedAmount && (
                      <p className="text-xs text-muted-foreground">
                        Investiu: {formatCurrency(partner.investedAmount)}
                      </p>
                    )}
                  </div>
                </div>
                <Progress value={partner.profitPercentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partners List */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes dos Sócios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium">Sócio</th>
                  <th className="p-4 text-left text-sm font-medium">Tipo</th>
                  <th className="p-4 text-left text-sm font-medium">Participação</th>
                  <th className="p-4 text-left text-sm font-medium">Investido</th>
                  <th className="p-4 text-left text-sm font-medium">Este Mês</th>
                  <th className="p-4 text-left text-sm font-medium">Total Recebido</th>
                  <th className="p-4 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {partnerDistributions.map((partner) => (
                  <tr key={partner.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(partner.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {partner.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`border-0 text-white ${partnerTypeColors[partner.type]}`}
                      >
                        {partnerTypeLabels[partner.type]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">
                        {partner.profitPercentage}%
                      </span>
                    </td>
                    <td className="p-4">
                      {partner.investedAmount
                        ? formatCurrency(partner.investedAmount)
                        : '-'}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-green-600">
                        {formatCurrency(partner.distribution)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">
                        {formatCurrency(partner.distribution * 6)}
                      </span>
                      <p className="text-xs text-muted-foreground">6 meses</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={partner.isActive ? 'success' : 'secondary'}>
                        {partner.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
