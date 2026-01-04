'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Filter,
  Loader2,
  Save,
  RefreshCw,
  Trash2,
  Edit,
} from 'lucide-react'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '@/types'

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
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Create/Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)

      const response = await fetch(`/api/tasks?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar tarefas')

      const data = await response.json()
      setTasks(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [filter, categoryFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Handle create
  const handleCreate = () => {
    setIsCreating(true)
    setEditingTask({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      category: 'GENERAL',
    })
    setEditModalOpen(true)
  }

  // Handle edit
  const handleEdit = (task: Task) => {
    setIsCreating(false)
    setEditingTask({ ...task })
    setEditModalOpen(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!editingTask) return

    if (!editingTask.title) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const url = isCreating ? '/api/tasks' : `/api/tasks/${editingTask.id}`
      const method = isCreating ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          status: editingTask.status,
          category: editingTask.category,
          dueDate: editingTask.dueDate,
        }),
      })

      if (!response.ok) throw new Error('Erro ao salvar tarefa')

      const savedTask = await response.json()

      if (isCreating) {
        setTasks(prev => [savedTask, ...prev])
      } else {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? savedTask : t))
      }

      setEditModalOpen(false)
      setEditingTask(null)

      toast({
        title: isCreating ? 'Tarefa criada!' : 'Tarefa atualizada!',
        description: `"${savedTask.title}" foi ${isCreating ? 'criada' : 'atualizada'} com sucesso.`,
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a tarefa.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      const updatedTask = await response.json()
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))

      toast({
        title: 'Status atualizado!',
        description: `Tarefa marcada como ${statusLabels[newStatus]}.`,
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  // Handle delete
  const handleDelete = (taskId: string) => {
    setDeletingTaskId(taskId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingTaskId) return

    try {
      const response = await fetch(`/api/tasks/${deletingTaskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir tarefa')

      setTasks(prev => prev.filter(t => t.id !== deletingTaskId))
      setDeleteDialogOpen(false)

      toast({
        title: 'Tarefa removida!',
        description: 'A tarefa foi removida com sucesso.',
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa.',
        variant: 'destructive',
      })
    } finally {
      setDeletingTaskId(null)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filter === 'all' || task.status === filter
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    return matchesStatus && matchesCategory
  })

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE')
  const urgentTasks = tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE')

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      className={cn(
        'p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer',
        task.status === 'DONE' && 'opacity-60'
      )}
      onClick={() => handleEdit(task)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === 'DONE'}
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation()
            handleStatusChange(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')
          }}
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
              {(task.priority === 'URGENT' || task.priority === 'HIGH') && (
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
      {/* Create/Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isCreating ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              {isCreating ? 'Nova Tarefa' : 'Editar Tarefa'}
            </DialogTitle>
            <DialogDescription>
              {isCreating ? 'Preencha os dados da nova tarefa.' : 'Faça as alterações necessárias.'}
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={editingTask.title || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="Ex: Processar pedidos pendentes"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Descreva a tarefa..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">A Fazer</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="REVIEW">Em Revisão</SelectItem>
                      <SelectItem value="DONE">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={editingTask.category}
                    onValueChange={(value) => setEditingTask({ ...editingTask, category: value as TaskCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">Geral</SelectItem>
                      <SelectItem value="SHIPPING">Envios</SelectItem>
                      <SelectItem value="INVENTORY">Estoque</SelectItem>
                      <SelectItem value="CUSTOMER">Cliente</SelectItem>
                      <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Limite</Label>
                  <Input
                    type="date"
                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div>
              {!isCreating && editingTask && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setEditModalOpen(false)
                    handleDelete(editingTask.id!)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Criar Tarefa' : 'Salvar'}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas diárias e pendências
          </p>
        </div>
        <Button onClick={handleCreate}>
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
                <p className="text-2xl font-bold">{urgentTasks.length}</p>
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        /* Kanban Board */
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
      )}
    </div>
  )
}
