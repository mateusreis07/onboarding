"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle2, Clock, MoreHorizontal, Plus, MessageSquare, Activity } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface AnalyticsData {
  totalEmployees: number
  onboardingInProgress: number
  completionRate: number
  averageDaysToComplete: number
  departmentStats: Record<string, number>
  employees: Array<{
    id: string
    name: string
    department: string | null
    startDate: string | null
    progress: number
    status: string
    tasks: Array<{ id: string, title: string, dueDate: string | null, status: string }>
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<AnalyticsData['employees'][0] | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isAddingTask, setIsAddingTask] = useState(false)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  async function fetchAnalyticsData() {
    try {
      const res = await fetch("/api/admin/analytics")
      if (res.ok) {
        const newData = await res.json()
        setData(newData)

        // Sync selectedEmployee if open to reflect new tasks/status
        if (selectedEmployee) {
          const updatedEmp = newData.employees.find((e: any) => e.id === selectedEmployee.id)
          if (updatedEmp) setSelectedEmployee(updatedEmp)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const openDetails = (employee: AnalyticsData['employees'][0]) => {
    setSelectedEmployee(employee)
    setIsDetailsOpen(true)
    setIsAddingTask(false)
  }

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

    // Optimistic Update
    if (selectedEmployee) {
      const updatedTasks = selectedEmployee.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
      setSelectedEmployee({ ...selectedEmployee, tasks: updatedTasks })
    }

    await fetch('/api/admin/tasks', {
      method: 'PATCH',
      body: JSON.stringify({ taskId, status: newStatus })
    })
    fetchAnalyticsData()
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle || !selectedEmployee) return

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedEmployee.id,
          title: newTaskTitle,
          type: 'CHECKLIST',
          dueDate: new Date().toISOString()
        })
      })

      if (res.ok) {
        const newTask = await res.json()

        // Optimistic / Manual Update to ensure UI reflects changes immediately
        if (selectedEmployee) {
          const updatedTasks = [...selectedEmployee.tasks, {
            id: newTask.id,
            title: newTask.title,
            dueDate: newTask.dueDate,
            status: newTask.status
          }]

          // Recalculate local progress visualization
          const completedCount = updatedTasks.filter(t => t.status === 'COMPLETED').length
          const newProgress = Math.round((completedCount / updatedTasks.length) * 100)

          setSelectedEmployee({
            ...selectedEmployee,
            tasks: updatedTasks,
            progress: newProgress
          })
        }

        setNewTaskTitle("")
        setIsAddingTask(false)
        fetchAnalyticsData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return <div className="p-8">Carregando painel de gestão...</div>
  }

  if (!data) return null

  // Filter employees with delayed onboarding (e.g. progress < 50% and started > 7 days ago - Mock logic)
  const attentionEmployees = data.employees.filter(e => e.progress < 50)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Gestão e Progresso</h1>
        <p className="text-muted-foreground">Acompanhe a evolução dos novos colaboradores e gerencie tarefas.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Novos Colaboradores</CardTitle>
            <Avatar className="h-4 w-4">
              <AvatarFallback className="bg-transparent text-muted-foreground">👥</AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">no processo de onboarding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.onboardingInProgress}</div>
            <p className="text-xs text-muted-foreground">processos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão Global</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completionRate}%</div>
            <Progress value={data.completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos de Atenção</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attentionEmployees.length}</div>
            <p className="text-xs text-muted-foreground">colaboradores com atraso</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral por Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Colaborador</th>
                    <th className="px-4 py-3">Depto</th>
                    <th className="px-4 py-3">Progresso</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.employees.map(employee => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{employee.name}</td>
                      <td className="px-4 py-3 text-gray-500">{employee.department || '-'}</td>
                      <td className="px-4 py-3 w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={employee.progress} className="h-2 w-full" />
                          <span className="text-xs">{Math.round(employee.progress)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={employee.progress >= 100 ? 'default' : 'secondary'}>
                          {employee.progress >= 100 ? 'Concluído' : 'Em Andamento'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" className="h-8" onClick={() => openDetails(employee)}>Gerenciar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pontos de Atenção</CardTitle>
            <CardDescription>Colaboradores que precisam de suporte.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attentionEmployees.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum ponto de atenção identificado.</p>
              ) : (
                attentionEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-red-900">{emp.name}</p>
                        <p className="text-xs text-red-600">Progresso estagnado em {Math.round(emp.progress)}%</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-700 hover:text-red-900 hover:bg-red-100" onClick={() => openDetails(emp)}>Ver</Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestão de Colaborador: {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>Acompanhe tarefas, atribua atividades e registre feedbacks.</DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <Tabs defaultValue="tasks" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <TabsList className="grid w-full grid-cols-2 shrink-0">
                <TabsTrigger value="tasks">Tarefas e Progresso</TabsTrigger>
                <TabsTrigger value="feedback">Feedbacks e Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="flex-1 flex flex-col overflow-hidden mt-4 min-h-0 data-[state=inactive]:hidden">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="font-medium">Lista de Atividades</h3>
                  <Button size="sm" onClick={() => setIsAddingTask(!isAddingTask)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Nova Tarefa
                  </Button>
                </div>

                {isAddingTask && (
                  <div className="mb-4 p-4 bg-slate-50 rounded border animate-in slide-in-from-top-2 shrink-0">
                    <Label>Título da Nova Tarefa</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Ex: Agendar reunião de alinhamento..."
                      />
                      <Button onClick={handleCreateTask}>Adicionar</Button>
                    </div>
                  </div>
                )}

                <ScrollArea className="flex-1 h-full -mr-4 pr-4">
                  <div className="space-y-3 pb-10">
                    {selectedEmployee.tasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Nenhuma tarefa atribuída.</p>
                    ) : (
                      selectedEmployee.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${task.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}
                              onClick={() => handleTaskToggle(task.id, task.status)}
                            >
                              {task.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </p>
                              {task.dueDate && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant={task.status === 'COMPLETED' ? 'default' : 'outline'}>
                            {task.status === 'COMPLETED' ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="feedback" className="flex-1 mt-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-lg text-center border">
                    <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Central de Feedbacks</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Use a ferramenta dedicada de Avaliação e Feedback para registrar notas formais, avaliações de 30/90 dias e acompanhar sentimentos.
                    </p>
                    <Link href="/dashboard/feedback" target="_blank">
                      <Button>
                        Ir para Avaliações de {selectedEmployee.name.split(' ')[0]}
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
