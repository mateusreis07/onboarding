"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, AlertCircle, Briefcase, User as UserIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  type: string
  dueDate?: string
  completedAt?: string
  onboarding?: {
    user: {
      name: string
      email: string
      department: string
    }
  }
}

interface OnboardingData {
  id: string
  status: string
  progress: number
  tasks: Task[]
}

const statusTranslations: Record<string, string> = {
  "COMPLETED": "CONCLUÍDO",
  "IN_PROGRESS": "EM ANDAMENTO",
  "PENDING": "PENDENTE",
  "OVERDUE": "ATRASADO"
}

const typeTranslations: Record<string, string> = {
  "CHECKLIST": "CHECKLIST",
  "DOCUMENT_UPLOAD": "ENVIO DE DOCUMENTO",
  "TRAINING": "TREINAMENTO",
  "FORM": "FORMULÁRIO"
}

export default function TasksPage() {
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [onboardingRes, assignedRes] = await Promise.all([
        fetch("/api/my-onboarding"),
        fetch("/api/assigned-tasks")
      ])

      if (onboardingRes.ok) {
        const data = await onboardingRes.json()
        setOnboarding(data)
      }

      if (assignedRes.ok) {
        const data = await assignedRes.json()
        setAssignedTasks(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED"

    try {
      const res = await fetch(`/api/my-onboarding/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        fetchData() // Refresh to get updated progress
      }
    } catch (error) {
      console.error(error)
    }
  }

  function getTaskIcon(status: string) {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "OVERDUE":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      COMPLETED: "default",
      IN_PROGRESS: "secondary",
      PENDING: "outline",
      OVERDUE: "destructive"
    }
    return <Badge variant={variants[status] || "outline"}>{statusTranslations[status] || status}</Badge>
  }

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-3 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const MyOnboardingContent = () => {
    if (!onboarding) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Nenhum Onboarding Atribuído</h3>
            <p className="text-muted-foreground">Você ainda não possui um plano de onboarding ativo. Entre em contato com o RH.</p>
          </CardContent>
        </Card>
      )
    }

    const pendingTasks = onboarding.tasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS")
    const completedTasks = onboarding.tasks.filter(t => t.status === "COMPLETED")
    const totalTasks = onboarding.tasks.length

    // Calculate progress based on visible tasks (user's tasks) only
    const progress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0
    const isCompleted = progress === 100

    return (
      <div className="space-y-8">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
            <CardDescription>
              {completedTasks.length} de {totalTasks} tarefas concluídas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-2xl">{progress}%</span>
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {isCompleted ? "CONCLUÍDO" : (statusTranslations[onboarding.status] || onboarding.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Tarefas Pendentes</h3>
            <div className="grid gap-4">
              {pendingTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.status === "COMPLETED"}
                        onCheckedChange={() => toggleTask(task.id, task.status)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getTaskIcon(task.status)}
                          <h4 className="font-semibold">{task.title}</h4>
                          {getStatusBadge(task.status)}
                          <Badge variant="outline">{typeTranslations[task.type] || task.type}</Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-muted-foreground">Tarefas Concluídas</h3>
            <div className="grid gap-4">
              {completedTasks.map((task) => (
                <Card key={task.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => toggleTask(task.id, task.status)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getTaskIcon(task.status)}
                          <h4 className="font-semibold line-through">{task.title}</h4>
                          {getStatusBadge(task.status)}
                        </div>
                        {task.completedAt && (
                          <p className="text-xs text-muted-foreground">
                            Concluído em: {new Date(task.completedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isCompleted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-700 mb-2">Parabéns! 🎉</h3>
              <p className="text-green-600">Você completou sua jornada de onboarding. Bem-vindo ao time!</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Tarefas</h2>
        <p className="text-muted-foreground">Gerencie suas atividades diárias.</p>
      </header>

      <Tabs defaultValue="my-onboarding" className="w-full">
        <TabsList>
          <TabsTrigger value="my-onboarding">Meu Onboarding</TabsTrigger>
          {assignedTasks.length > 0 && (
            <TabsTrigger value="assigned">Tarefas da Minha Área <Badge variant="secondary" className="ml-2">{assignedTasks.filter(t => t.status !== 'COMPLETED').length}</Badge></TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-onboarding" className="mt-6">
          <MyOnboardingContent />
        </TabsContent>

        <TabsContent value="assigned" className="mt-6">
          <div className="grid gap-4">
            {assignedTasks.length === 0 ? (
              <p className="text-muted-foreground p-4">Nenhuma tarefa atribuída à sua área.</p>
            ) : (
              assignedTasks.map(task => (
                <Card key={task.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.status === "COMPLETED"}
                        onCheckedChange={() => toggleTask(task.id, task.status)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-lg">{task.title}</h4>
                          {getStatusBadge(task.status)}
                        </div>
                        {task.description && <p className="text-muted-foreground text-sm mb-3">{task.description}</p>}

                        <div className="flex items-center gap-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            <span>Colaborador: <span className="font-medium text-gray-900">{task.onboarding?.user.name}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            <span>Departamento: <span className="font-medium text-gray-900">{task.onboarding?.user.department}</span></span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
