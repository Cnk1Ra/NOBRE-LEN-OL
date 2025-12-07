'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
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
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  platform: 'facebook' | 'instagram' | 'google' | 'tiktok'
  status: 'active' | 'paused' | 'ended'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpc: number
  roas: number
  startDate: string
  endDate?: string
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Black Friday 2024',
    platform: 'facebook',
    status: 'active',
    budget: 5000,
    spent: 3245.80,
    impressions: 125000,
    clicks: 4500,
    conversions: 180,
    revenue: 18500,
    ctr: 3.6,
    cpc: 0.72,
    roas: 5.7,
    startDate: '2024-11-20',
    endDate: '2024-11-30',
  },
  {
    id: '2',
    name: 'Remarketing - Carrinho',
    platform: 'instagram',
    status: 'active',
    budget: 2000,
    spent: 1580.50,
    impressions: 45000,
    clicks: 2100,
    conversions: 95,
    revenue: 9800,
    ctr: 4.7,
    cpc: 0.75,
    roas: 6.2,
    startDate: '2024-11-01',
  },
  {
    id: '3',
    name: 'Busca - Produtos',
    platform: 'google',
    status: 'active',
    budget: 3000,
    spent: 2150.00,
    impressions: 35000,
    clicks: 1800,
    conversions: 72,
    revenue: 7200,
    ctr: 5.1,
    cpc: 1.19,
    roas: 3.3,
    startDate: '2024-10-15',
  },
  {
    id: '4',
    name: 'Viral - Unboxing',
    platform: 'tiktok',
    status: 'paused',
    budget: 1500,
    spent: 890.25,
    impressions: 280000,
    clicks: 8500,
    conversions: 45,
    revenue: 4500,
    ctr: 3.0,
    cpc: 0.10,
    roas: 5.1,
    startDate: '2024-11-10',
  },
  {
    id: '5',
    name: 'Lookalike - Compradores',
    platform: 'facebook',
    status: 'ended',
    budget: 2500,
    spent: 2500,
    impressions: 95000,
    clicks: 3200,
    conversions: 128,
    revenue: 12800,
    ctr: 3.4,
    cpc: 0.78,
    roas: 5.1,
    startDate: '2024-10-01',
    endDate: '2024-10-31',
  },
]

const platformColors = {
  facebook: 'bg-blue-500',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  google: 'bg-red-500',
  tiktok: 'bg-black',
}

const platformLabels = {
  facebook: 'Facebook Ads',
  instagram: 'Instagram Ads',
  google: 'Google Ads',
  tiktok: 'TikTok Ads',
}

const statusLabels = {
  active: 'Ativa',
  paused: 'Pausada',
  ended: 'Finalizada',
}

const statusVariants: Record<string, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  paused: 'warning',
  ended: 'secondary',
}

export default function CampaignsPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredCampaigns = filter === 'all'
    ? mockCampaigns
    : mockCampaigns.filter(c => c.platform === filter)

  const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.spent, 0)
  const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0)
  const totalConversions = mockCampaigns.reduce((sum, c) => sum + c.conversions, 0)
  const avgRoas = totalRevenue / totalSpent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de marketing e acompanhe o desempenho
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investido</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent, 'BRL')}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Gerada</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue, 'BRL')}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversões</p>
                <p className="text-2xl font-bold">{totalConversions}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROAS Médio</p>
                <p className="text-2xl font-bold">{avgRoas.toFixed(1)}x</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button
          variant={filter === 'facebook' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('facebook')}
        >
          Facebook
        </Button>
        <Button
          variant={filter === 'instagram' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('instagram')}
        >
          Instagram
        </Button>
        <Button
          variant={filter === 'google' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('google')}
        >
          Google
        </Button>
        <Button
          variant={filter === 'tiktok' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('tiktok')}
        >
          TikTok
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${platformColors[campaign.platform]} flex items-center justify-center text-white font-bold`}>
                    {campaign.platform[0].toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{platformLabels[campaign.platform]}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Ver Relatório
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={statusVariants[campaign.status]}>
                  {statusLabels[campaign.status]}
                </Badge>
                <span className="text-sm font-medium">
                  ROAS: <span className={campaign.roas >= 3 ? 'text-green-500' : 'text-orange-500'}>{campaign.roas}x</span>
                </span>
              </div>

              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orçamento</span>
                  <span>{formatCurrency(campaign.spent, 'BRL')} / {formatCurrency(campaign.budget, 'BRL')}</span>
                </div>
                <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Impressões</p>
                    <p className="text-sm font-medium">{(campaign.impressions / 1000).toFixed(0)}k</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliques</p>
                    <p className="text-sm font-medium">{campaign.clicks.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Conversões</p>
                    <p className="text-sm font-medium">{campaign.conversions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Receita</p>
                    <p className="text-sm font-medium text-green-500">{formatCurrency(campaign.revenue, 'BRL')}</p>
                  </div>
                </div>
              </div>

              {/* CTR and CPC */}
              <div className="flex justify-between text-xs pt-2 border-t text-muted-foreground">
                <span>CTR: {campaign.ctr}%</span>
                <span>CPC: {formatCurrency(campaign.cpc, 'BRL')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
