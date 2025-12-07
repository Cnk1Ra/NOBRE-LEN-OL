'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { cn, formatDate, getInitials } from '@/lib/utils'
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '@/types'

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Processar pedidos pendentes do dia',
    description: 'Revisar e confirmar 15 pedidos aguardando processamento',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: new Date().toISOString(),
    category: 'SHIPPING',
    assignee: { id: '1', name: 'João Silva' },
  },
  {
    id: '2',
    title: 'Contatar clientes com entrega falha',
    description: 'Ligar para 5 clientes que tiveram falha na primeira tentativa de entrega',
    priority: 'URGENT',
    status: 'TODO',
    dueDate: new Date().toISOString(),
    category: 'CUSTOMER',
    assignee: { id: '2', name: 'Maria Santos' },
  },
  {
    id: '3',
    title: 'Reabastecer estoque - Produto X',
    description: 'Estoque abaixo do mínimo (5 unidades). Fazer pedido de 50 unidades.',
    priority: 'HIGH',
    status: 'TODO',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    category: 'INVENTORY',
  },
  {
    id: '4',
    title: 'Revisar campanhas do Facebook',
    description: 'Analisar performance das campanhas e pausar as com ROAS < 2',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    category: 'MARKETING',
  },
  {
    id: '5',
    title: 'Emitir notas fiscais do mês',
    description: 'Gerar notas fiscais para os 335 pedidos entregues em dezembro',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    category: 'FINANCIAL',
  },
  {
    id: '6',
    title: 'Atualizar preços no Shopify',
    description: 'Ajustar preços de acordo com nova tabela de custos',
    priority: 'LOW',
    status: 'DONE',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'GENERAL',
    assignee: { id: '1', name: 'João Silva' },
  },
]

const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Progresso',
  REVIEW: 'Em Revisão',
  DONE: 'Concluída',
  CANCELLED: 'Cancelada',
}

const categoryLabels: Record<TaskCategory, string> = {
  GENERAL: 'Geral',
  SHIPPING: 'Envios',
  INVENTORY: 'Estoque',
  CUSTOMER: 'Cliente',
  FINANCIAL: 'Financeiro',
  MARKETING: 'Marketing',
}

const categoryColors: Record<TaskCategory, string> = {
  GENERAL: 'bg-gray-500',
  SHIPPING: 'bg-blue-500',
  INVENTORY: 'bg-purple-500',
  CUSTOMER: 'bg-green-500',
  FINANCIAL: 'bg-yellow-500',
  MARKETING: 'bg-pink-500',
}

export default function TasksPage() {
  const [filter, setFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredTasks = mockTasks.filter((task) => {
    const matchesStatus = filter === 'all' || task.status === filter
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    return matchesStatus && matchesCategory
  })

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE')

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      className={cn(
        'p-4 rounded-lg border bg-card hover:shadow-md transition-shadow',
        task.status === 'DONE' && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === 'DONE'}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'font-medium leading-tight',
                task.status === 'DONE' && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </h4>
            <div className={cn('shrink-0', priorityColors[task.priority])}>
              {task.priority === 'URGENT' && (
                <AlertCircle className="h-4 w-4" />
              )}
              {task.priority === 'HIGH' && (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                'text-xs border-0 text-white',
                categoryColors[task.category]
              )}
            >
              {categoryLabels[task.category]}
            </Badge>

            <Badge variant="outline" className="text-xs">
              {priorityLabels[task.priority]}
            </Badge>

            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {task.assignee && (
            <div className="flex items-center gap-2 pt-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {task.assignee.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas diárias e pendências
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Circle className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold">{todoTasks.length}</p>
                <p className="text-xs text-muted-foreground">A Fazer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inProgressTasks.length}</p>
                <p className="text-xs text-muted-foreground">Em Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{doneTasks.length}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {mockTasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE').length}
                </p>
                <p className="text-xs text-muted-foreground">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="TODO">A Fazer</SelectItem>
            <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
            <SelectItem value="DONE">Concluídas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="SHIPPING">Envios</SelectItem>
            <SelectItem value="INVENTORY">Estoque</SelectItem>
            <SelectItem value="CUSTOMER">Cliente</SelectItem>
            <SelectItem value="FINANCIAL">Financeiro</SelectItem>
            <SelectItem value="MARKETING">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* To Do */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Circle className="h-4 w-4 text-gray-400" />
              A Fazer
              <Badge variant="secondary" className="ml-auto">
                {todoTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhuma tarefa pendente
              </p>
            )}
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4 text-blue-500" />
              Em Progresso
              <Badge variant="secondary" className="ml-auto">
                {inProgressTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhuma tarefa em progresso
              </p>
            )}
          </CardContent>
        </Card>

        {/* Done */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Concluídas
              <Badge variant="secondary" className="ml-auto">
                {doneTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doneTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {doneTasks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhuma tarefa concluída
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
