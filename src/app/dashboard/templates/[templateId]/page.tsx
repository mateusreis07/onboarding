"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ArrowLeft, Pencil, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

interface Task {
  id: string
  title: string
  description?: string
  type: string
  dueDayOffset: number
  assigneeRole?: string
}

interface TemplateDetailProps {
  params: Promise<{
    templateId: string
  }>
}

interface SystemOption {
  code: string
  label: string
  category?: string
}

interface SystemOptions {
  roles: SystemOption[]
  departments: SystemOption[]
  jobTitles: SystemOption[]
  jobTitlesByCategory: Record<string, { code: string; label: string }[]>
}

const typeTranslations: Record<string, string> = {
  "CHECKLIST": "Checklist",
  "DOCUMENT_UPLOAD": "Envio de Doc",
  "TRAINING": "Treinamento",
  "FORM": "Formulário"
}

export default function TemplateDetailPage({ params }: TemplateDetailProps) {
  const { templateId } = use(params)
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [templateData, setTemplateData] = useState({ title: "", description: "", jobTitle: "", department: "" })
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", description: "", type: "CHECKLIST", dueDayOffset: 0, assigneeRole: "EMPLOYEE" })
  const [loading, setLoading] = useState(true)
  const [systemOptions, setSystemOptions] = useState<SystemOptions>({
    roles: [],
    departments: [],
    jobTitles: [],
    jobTitlesByCategory: {}
  })
  const router = useRouter()

  const getJobTitleLabel = (code: string) => {
    if (!code || code === "GERAL") return "Geral"
    const jt = systemOptions.jobTitles.find(j => j.code === code)
    return jt?.label || code
  }

  const getDepartmentLabel = (code: string) => {
    const dept = systemOptions.departments.find(d => d.code === code)
    return dept?.label || code
  }

  const getRoleLabel = (code: string) => {
    const role = systemOptions.roles.find(r => r.code === code)
    return role?.label || code
  }

  // Check authorization
  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "HR") {
      alert("Acesso negado. Apenas usuários com perfil RH podem acessar esta página.")
      router.push("/dashboard")
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "HR") {
      fetchTasks()
      fetchTemplateDetails()
      fetchSystemOptions()
    }
  }, [session])

  async function fetchSystemOptions() {
    try {
      const res = await fetch("/api/system-options")
      if (res.ok) {
        setSystemOptions(await res.json())
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchTemplateDetails() {
    try {
      const res = await fetch(`/api/templates/${templateId}`)
      if (res.ok) {
        const data = await res.json()
        setTemplateData({
          title: data.title,
          description: data.description || "",
          jobTitle: data.jobTitle || "",
          department: data.department || ""
        })
      }
    } catch (e) { console.error(e) }
  }

  async function fetchTasks() {
    try {
      const res = await fetch(`/api/templates/${templateId}/tasks`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTask() {
    if (!newTask.title) return

    try {
      const res = await fetch(`/api/templates/${templateId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      })

      if (res.ok) {
        setNewTask({ title: "", description: "", type: "CHECKLIST", dueDayOffset: 0, assigneeRole: "EMPLOYEE" })
        fetchTasks()
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return

    try {
      const res = await fetch(`/api/templates/tasks/${taskId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleUpdateTemplate() {
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData)
      })
      if (res.ok) {
        setIsEditingInfo(false)
        alert("Template atualizado com sucesso!")
      }
    } catch (e) {
      console.error(e)
      alert("Erro ao atualizar template")
    }
  }

  async function handleDeleteTemplate() {
    if (!confirm("Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.")) return

    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        alert("Template excluído com sucesso")
        router.push("/dashboard/templates")
      }
    } catch (e) {
      console.error(e)
      alert("Erro ao excluir template")
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {templateData.title || "Carregando..."}
            </h2>
            <p className="text-muted-foreground">Gerenciar template e tarefas.</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDeleteTemplate}>
          <Trash2 className="h-4 w-4 mr-2" /> Excluir Template
        </Button>
      </div>

      {/* Template Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Detalhes do Template</CardTitle>
          {!isEditingInfo ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingInfo(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar Detalhes
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsEditingInfo(false); fetchTemplateDetails() }}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleUpdateTemplate}>
                <Save className="h-4 w-4 mr-2" /> Salvar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          {isEditingInfo ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Template</Label>
                  <Input value={templateData.title} onChange={e => setTemplateData({ ...templateData, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select value={templateData.department} onValueChange={(val) => setTemplateData({ ...templateData, department: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systemOptions.departments.map(dept => (
                        <SelectItem key={dept.code} value={dept.code}>{dept.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={templateData.description} onChange={e => setTemplateData({ ...templateData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cargo Associado (Opcional)</Label>
                <Select value={templateData.jobTitle} onValueChange={v => setTemplateData({ ...templateData, jobTitle: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="GERAL">Geral (todos os cargos)</SelectItem>
                    {Object.entries(systemOptions.jobTitlesByCategory).map(([category, titles]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {titles.map(title => (
                          <SelectItem key={title.code} value={title.code}>
                            {title.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold block mb-1">Título:</span>
                  {templateData.title}
                </div>
                <div>
                  <span className="font-semibold block mb-1">Departamento:</span>
                  {getDepartmentLabel(templateData.department) || "-"}
                </div>
              </div>
              <div>
                <span className="font-semibold block mb-1">Descrição:</span>
                <p className="text-muted-foreground">{templateData.description || "-"}</p>
              </div>
              <div>
                <span className="font-semibold block mb-1">Cargo:</span>
                {getJobTitleLabel(templateData.jobTitle)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* List of Tasks */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Tarefas</CardTitle>
              <CardDescription>As tarefas são ordenadas pelo prazo em dias (Dia 0 = Primeiro Dia).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div>Carregando...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">Nenhuma tarefa definida ainda.</div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{task.title}</span>
                        <Badge variant="secondary">{typeTranslations[task.type] || task.type}</Badge>
                        <Badge variant="outline">Dia {task.dueDayOffset}</Badge>
                        {task.assigneeRole && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">{task.assigneeRole}</Badge>}
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add New Task Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título da Tarefa</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="ex: Configurar E-mail Corporativo"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Instruções detalhadas..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newTask.type} onValueChange={(val) => setNewTask({ ...newTask, type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHECKLIST">Checklist</SelectItem>
                      <SelectItem value="DOCUMENT_UPLOAD">Envio de Doc</SelectItem>
                      <SelectItem value="TRAINING">Treinamento</SelectItem>
                      <SelectItem value="FORM">Formulário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prazo (Dias)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newTask.dueDayOffset}
                    onChange={(e) => setNewTask({ ...newTask, dueDayOffset: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Responsável (Quem realiza a tarefa)</Label>
                  <Select value={newTask.assigneeRole} onValueChange={(val) => setNewTask({ ...newTask, assigneeRole: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Colaborador (Auto-atribuição)</SelectItem>
                      {systemOptions.roles.filter(r => r.code !== 'EMPLOYEE').map(role => (
                        <SelectItem key={role.code} value={role.code}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full" onClick={handleAddTask}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Tarefa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
