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
  ShoppingCart,
  BarChart3,
  Pause,
  Play,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Zap,
  Copy,
  Music2,
} from 'lucide-react'
import { useCountry } from '@/contexts/country-context'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'ended'
  type: string
  budget: number
  budgetType: 'daily' | 'lifetime'
  spent: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  videoViews: number
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  roas: number
  profit: number
  startDate: string
}

// TikTok Ads campaigns - starts empty, will be populated when TikTok Ads is connected
const initialCampaigns: Campaign[] = []

export default function TikTokAdsPage() {
  const { formatCurrency } = useCountry()

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

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totals = campaigns.reduce((acc, c) => ({
    spent: acc.spent + c.spent,
    revenue: acc.revenue + c.revenue,
    profit: acc.profit + c.profit,
    conversions: acc.conversions + c.conversions,
    impressions: acc.impressions + c.impressions,
    clicks: acc.clicks + c.clicks,
    videoViews: acc.videoViews + c.videoViews,
  }), { spent: 0, revenue: 0, profit: 0, conversions: 0, impressions: 0, clicks: 0, videoViews: 0 })

  const avgRoas = totals.spent > 0 ? totals.revenue / totals.spent : 0
  const avgCpa = totals.conversions > 0 ? totals.spent / totals.conversions : 0

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

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setEditForm({
      name: campaign.name,
      budget: campaign.budget.toString(),
      budgetType: campaign.budgetType,
    })
    setShowEditDialog(true)
  }

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

  const deleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    toast({
      title: 'Campanha Excluida',
      description: `"${campaign?.name}" foi excluida.`,
      className: 'bg-red-500 text-white',
    })
  }

  const duplicateCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: `tiktok-${Date.now()}`,
      name: `${campaign.name} (Copia)`,
      status: 'paused',
      spent: 0,
      revenue: 0,
      profit: 0,
      conversions: 0,
      impressions: 0,
      clicks: 0,
      videoViews: 0,
    }
    setCampaigns(prev => [...prev, newCampaign])
    toast({
      title: 'Campanha Duplicada',
      description: `"${newCampaign.name}" foi criada.`,
      className: 'bg-green-500 text-white',
    })
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'In-Feed Ads': return 'bg-blue-500'
      case 'Spark Ads': return 'bg-pink-500'
      case 'TopView': return 'bg-purple-500'
      case 'Branded Hashtag': return 'bg-orange-500'
      case 'Branded Effect': return 'bg-cyan-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10">
            <Music2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TikTok Ads</h1>
            <p className="text-muted-foreground">
              Gerencie suas campanhas de video do TikTok
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sincronizar
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open('https://ads.tiktok.com', '_blank')}>
            <ExternalLink className="h-4 w-4" />
            Abrir TikTok Ads
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Views Video</p>
                <p className="text-xl font-bold">{(totals.videoViews / 1000000).toFixed(2)}M</p>
              </div>
              <Music2 className="h-8 w-8 text-pink-500/20" />
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
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Orcamento</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">Views</TableHead>
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
                    <Badge className={cn("text-white", getTypeBadgeColor(campaign.type))}>
                      {campaign.type}
                    </Badge>
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
                  <TableCell className="text-right">{(campaign.videoViews / 1000).toFixed(0)}k</TableCell>
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
