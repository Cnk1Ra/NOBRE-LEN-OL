'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Building2,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  UserPlus,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  workspaces: {
    workspace: {
      id: string
      name: string
      slug: string
    }
  }[]
  _count: {
    tasks: number
    activities: number
  }
}

interface Workspace {
  id: string
  name: string
  slug: string
  currency: string
  createdAt: string
  members: {
    user: {
      id: string
      name: string | null
      email: string
      role: string
    }
    role: string
  }[]
  _count: {
    orders: number
    products: number
    campaigns: number
  }
}

interface Stats {
  totals: {
    users: number
    workspaces: number
    orders: number
    products: number
  }
  usersByRole: Record<string, number>
  financial: {
    totalRevenue: number
    totalProfit: number
    avgOrderValue: number
  }
  recent: {
    users: User[]
    workspaces: Workspace[]
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [searchUser, setSearchUser] = useState('')
  const [searchWorkspace, setSearchWorkspace] = useState('')

  // Modal states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchStats()
      fetchUsers()
      fetchWorkspaces()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else if (res.status === 403) {
        router.push('/dashboard')
        toast({ title: 'Acesso negado', description: 'Apenas usuários Matrix.', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users?search=${searchUser}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`/api/admin/workspaces?search=${searchWorkspace}`)
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(data.workspaces)
      }
    } catch (error) {
      console.error('Erro ao buscar workspaces:', error)
    }
  }

  const handleCreateUser = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({ title: 'Usuário criado com sucesso!' })
        setIsCreateUserOpen(false)
        setFormData({ name: '', email: '', password: '', role: 'MEMBER' })
        fetchUsers()
        fetchStats()
      } else {
        const data = await res.json()
        toast({ title: 'Erro', description: data.error || 'Erro ao criar usuário', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao criar usuário', variant: 'destructive' })
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || undefined,
          email: formData.email || undefined,
          role: formData.role || undefined,
          password: formData.password || undefined,
        }),
      })

      if (res.ok) {
        toast({ title: 'Usuário atualizado com sucesso!' })
        setIsEditUserOpen(false)
        setSelectedUser(null)
        setFormData({ name: '', email: '', password: '', role: 'MEMBER' })
        fetchUsers()
      } else {
        const data = await res.json()
        toast({ title: 'Erro', description: data.error || 'Erro ao atualizar usuário', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar usuário', variant: 'destructive' })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'Usuário excluído com sucesso!' })
        setIsDeleteUserOpen(false)
        setSelectedUser(null)
        fetchUsers()
        fetchStats()
      } else {
        const data = await res.json()
        toast({ title: 'Erro', description: data.error || 'Erro ao excluir usuário', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir usuário', variant: 'destructive' })
    }
  }

  const openEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role,
    })
    setIsEditUserOpen(true)
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { color: string; label: string }> = {
      MATRIX: { color: 'bg-purple-500', label: 'Matrix' },
      ADMIN: { color: 'bg-red-500', label: 'Admin' },
      OWNER: { color: 'bg-blue-500', label: 'Owner' },
      MANAGER: { color: 'bg-green-500', label: 'Manager' },
      MEMBER: { color: 'bg-gray-500', label: 'Member' },
      VIEWER: { color: 'bg-yellow-500', label: 'Viewer' },
    }

    const config = roleConfig[role] || roleConfig.MEMBER

    return (
      <Badge className={`${config.color} text-white`}>
        {role === 'MATRIX' && <Crown className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Shield className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel Matrix</h1>
            <p className="text-muted-foreground">
              Administração global de todas as contas
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuários</p>
                  <p className="text-2xl font-bold">{stats.totals.users}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workspaces</p>
                  <p className="text-2xl font-bold">{stats.totals.workspaces}</p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pedidos</p>
                  <p className="text-2xl font-bold">{stats.totals.orders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.financial.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users by Role */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuários por Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center gap-2">
                  {getRoleBadge(role)}
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="gap-2">
            <Building2 className="h-4 w-4" />
            Workspaces
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              />
            </div>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Workspaces</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || '-'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.workspaces.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.workspaces.slice(0, 2).map((w) => (
                            <Badge key={w.workspace.id} variant="outline">
                              {w.workspace.name}
                            </Badge>
                          ))}
                          {user.workspaces.length > 2 && (
                            <Badge variant="outline">
                              +{user.workspaces.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDeleteUserOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar workspaces..."
                value={searchWorkspace}
                onChange={(e) => setSearchWorkspace(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && fetchWorkspaces()}
              />
            </div>
            <Button variant="outline" onClick={fetchWorkspaces}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead>Membros</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-medium">
                      {workspace.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-1 rounded">
                        {workspace.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{workspace.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {workspace.members.length}
                      </div>
                    </TableCell>
                    <TableCell>{workspace._count.orders}</TableCell>
                    <TableCell>{workspace._count.products}</TableCell>
                    <TableCell>{formatDate(workspace.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Adicione um novo usuário ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATRIX">Matrix (Super Admin)</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>Criar Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Nova Senha (deixe em branco para manter)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATRIX">Matrix (Super Admin)</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir Usuário
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário{' '}
              <strong>{selectedUser?.name || selectedUser?.email}</strong>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteUserOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
