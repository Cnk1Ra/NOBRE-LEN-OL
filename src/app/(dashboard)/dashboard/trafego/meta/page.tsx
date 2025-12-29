'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  MousePointer,
  ShoppingCart,
  BarChart3,
  Pause,
  Play,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Facebook,
  ExternalLink,
  Users,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Copy,
  Settings,
  Link2,
} from 'lucide-react'
import { useCountry } from '@/contexts/country-context'
import { useMeta } from '@/contexts/meta-context'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'ended'
  objective: string
  budget: number
  budgetType: 'daily' | 'lifetime'
  spent: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  reach: number
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  roas: number
  profit: number
  startDate: string
  endDate?: string
}

// Mock campaigns data
const initialCampaigns: Campaign[] = [
  {
    id: 'meta-1',
    name: 'Black Friday 2024 - Conversao',
    status: 'active',
    objective: 'Conversoes',
    budget: 5000,
    budgetType: 'daily',
    spent: 3245.80,
    revenue: 18500,
    impressions: 125000,
    clicks: 4500,
    conversions: 180,
    reach: 95000,
    ctr: 3.6,
    cpc: 0.72,
    cpm: 25.97,
    cpa: 18.03,
    roas: 5.7,
    profit: 15254.20,
    startDate: '2024-11-20',
    endDate: '2024-11-30',
  },
  {
    id: 'meta-2',
    name: 'Remarketing - Carrinho Abandonado',
    status: 'active',
    objective: 'Conversoes',
    budget: 2000,
    budgetType: 'daily',
    spent: 1580.50,
    revenue: 9800,
    impressions: 45000,
    clicks: 2100,
    conversions: 95,
    reach: 32000,
    ctr: 4.7,
    cpc: 0.75,
    cpm: 35.12,
    cpa: 16.64,
    roas: 6.2,
    profit: 8219.50,
    startDate: '2024-11-01',
  },
  {
    id: 'meta-3',
    name: 'Lookalike - Compradores VIP',
    status: 'active',
    objective: 'Conversoes',
    budget: 3000,
    budgetType: 'daily',
    spent: 2100.00,
    revenue: 12600,
    impressions: 85000,
    clicks: 3200,
    conversions: 126,
    reach: 68000,
    ctr: 3.76,
    cpc: 0.66,
    cpm: 24.71,
    cpa: 16.67,
    roas: 6.0,
    profit: 10500.00,
    startDate: '2024-11-05',
  },
  {
    id: 'meta-4',
    name: 'Prospeccao - Interesse Moda',
    status: 'paused',
    objective: 'Trafego',
    budget: 1500,
    budgetType: 'daily',
    spent: 980.00,
    revenue: 2940,
    impressions: 62000,
    clicks: 1800,
    conversions: 29,
    reach: 48000,
    ctr: 2.9,
    cpc: 0.54,
    cpm: 15.81,
    cpa: 33.79,
    roas: 3.0,
    profit: 1960.00,
    startDate: '2024-10-20',
  },
  {
    id: 'meta-5',
    name: 'Video Views - Institucional',
    status: 'active',
    objective: 'Video Views',
    budget: 800,
    budgetType: 'daily',
    spent: 520.00,
    revenue: 1560,
    impressions: 180000,
    clicks: 3200,
    conversions: 18,
    reach: 120000,
    ctr: 1.8,
    cpc: 0.16,
    cpm: 2.89,
    cpa: 28.89,
    roas: 3.0,
    profit: 1040.00,
    startDate: '2024-11-15',
  },
]

export default function MetaAdsPage() {
  const { formatCurrency } = useCountry()
  const { isConnected, lastSync, refreshData, isLoading } = useMeta()

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    budget: '',
    budgetType: 'daily' as 'daily' | 'lifetime',
  })

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate totals
  const totals = campaigns.reduce((acc, c) => ({
    spent: acc.spent + c.spent,
    revenue: acc.revenue + c.revenue,
    profit: acc.profit + c.profit,
    conversions: acc.conversions + c.conversions,
    impressions: acc.impressions + c.impressions,
    clicks: acc.clicks + c.clicks,
  }), { spent: 0, revenue: 0, profit: 0, conversions: 0, impressions: 0, clicks: 0 })

  const avgRoas = totals.spent > 0 ? totals.revenue / totals.spent : 0
  const avgCpa = totals.conversions > 0 ? totals.spent / totals.conversions : 0

  // Toggle campaign status
  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newStatus = c.status === 'active' ? 'paused' : 'active'
        toast({
          title: newStatus === 'active' ? 'Campanha Ativada' : 'Campanha Pausada',
          description: `"${c.name}" foi ${newStatus === 'active' ? 'ativada' : 'pausada'} com sucesso.`,
          className: newStatus === 'active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white',
        })
        return { ...c, status: newStatus }
      }
      return c
    }))
  }

  // Open edit dialog
  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setEditForm({
      name: campaign.name,
      budget: campaign.budget.toString(),
      budgetType: campaign.budgetType,
    })
    setShowEditDialog(true)
  }

  // Save campaign changes
  const saveCampaignChanges = () => {
    if (!editingCampaign) return

    setCampaigns(prev => prev.map(c => {
      if (c.id === editingCampaign.id) {
        return {
          ...c,
          name: editForm.name,
          budget: parseFloat(editForm.budget) || c.budget,
          budgetType: editForm.budgetType,
        }
      }
      return c
    }))

    toast({
      title: 'Campanha Atualizada',
      description: 'As alteracoes foram salvas com sucesso.',
      className: 'bg-green-500 text-white',
    })

    setShowEditDialog(false)
    setEditingCampaign(null)
  }

  // Delete campaign
  const deleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    toast({
      title: 'Campanha Excluida',
      description: `"${campaign?.name}" foi excluida.`,
      className: 'bg-red-500 text-white',
    })
  }

  // Duplicate campaign
  const duplicateCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: `meta-${Date.now()}`,
      name: `${campaign.name} (Copia)`,
      status: 'paused',
      spent: 0,
      revenue: 0,
      profit: 0,
      conversions: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
    }
    setCampaigns(prev => [...prev, newCampaign])
    toast({
      title: 'Campanha Duplicada',
      description: `"${newCampaign.name}" foi criada.`,
      className: 'bg-green-500 text-white',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1877F2]/10">
            <Facebook className="h-8 w-8 text-[#1877F2]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meta Ads</h1>
            <p className="text-muted-foreground">
              Gerencie suas campanhas do Facebook e Instagram
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refreshData()} disabled={isLoading} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Sincronizar
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open('https://business.facebook.com', '_blank')}>
            <ExternalLink className="h-4 w-4" />
            Abrir Meta Business
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Investido</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totals.spent)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Receita</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totals.revenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Lucro</p>
                <p className={cn("text-xl font-bold", totals.profit >= 0 ? "text-green-600" : "text-red-600")}>
                  {formatCurrency(totals.profit)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ROAS</p>
                <p className={cn("text-xl font-bold", avgRoas >= 3 ? "text-green-600" : avgRoas >= 2 ? "text-yellow-600" : "text-red-600")}>
                  {avgRoas.toFixed(2)}x
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">CPA Medio</p>
                <p className="text-xl font-bold">{formatCurrency(avgCpa)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conversoes</p>
                <p className="text-xl font-bold">{totals.conversions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
              <SelectItem value="ended">Finalizadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCampaigns.length} campanha(s) • {campaigns.filter(c => c.status === 'active').length} ativa(s)
        </div>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>
            Gerencie suas campanhas ativas e pausadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead className="text-right">Orcamento</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">CPA</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead className="w-[100px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map(campaign => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Switch
                      checked={campaign.status === 'active'}
                      onCheckedChange={() => toggleCampaignStatus(campaign.id)}
                      disabled={campaign.status === 'ended'}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Inicio: {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.objective}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <p className="font-medium">{formatCurrency(campaign.budget)}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.budgetType === 'daily' ? '/dia' : 'total'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {formatCurrency(campaign.spent)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(campaign.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={cn(
                      "text-white",
                      campaign.roas >= 3 ? "bg-green-500" : campaign.roas >= 2 ? "bg-yellow-500" : "bg-red-500"
                    )}>
                      {campaign.roas.toFixed(1)}x
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(campaign.cpa)}</TableCell>
                  <TableCell className="text-right font-medium">{campaign.conversions}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(campaign)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateCampaign(campaign)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleCampaignStatus(campaign.id)}>
                          {campaign.status === 'active' ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Campanha</DialogTitle>
            <DialogDescription>
              Altere as configuracoes da campanha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Nome da Campanha</Label>
              <Input
                id="campaignName"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Orcamento</Label>
                <Input
                  id="budget"
                  type="number"
                  value={editForm.budget}
                  onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetType">Tipo</Label>
                <Select
                  value={editForm.budgetType}
                  onValueChange={(v: 'daily' | 'lifetime') => setEditForm(prev => ({ ...prev, budgetType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="lifetime">Vitalicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCampaignChanges}>
              Salvar Alteracoes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
