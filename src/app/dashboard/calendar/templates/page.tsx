"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Calendar, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface EventTemplate {
  id: string
  title: string
  description: string | null
  eventType: string
  dayOffset: number
  startHour: number
  startMinute: number
  durationMinutes: number
  location: string | null
  meetingUrl: string | null
  role: string | null
  mandatory: boolean
}

const eventTypeLabels: Record<string, string> = {
  ONBOARDING_MEETING: "Reunião de Onboarding",
  ONE_ON_ONE: "1:1 com Gestor",
  TEAM_INTEGRATION: "Integração com Equipe",
  TRAINING_SESSION: "Treinamento",
  CUSTOM: "Personalizado"
}

export default function EventTemplatesPage() {
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    fetch("/api/admin/event-templates")
      .then(res => res.json())
      .then(data => {
        setTemplates(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      eventType: formData.get("eventType"),
      dayOffset: parseInt(formData.get("dayOffset") as string),
      startHour: parseInt(formData.get("startHour") as string),
      startMinute: parseInt(formData.get("startMinute") as string),
      durationMinutes: parseInt(formData.get("durationMinutes") as string),
      location: formData.get("location"),
      meetingUrl: formData.get("meetingUrl"),
      role: formData.get("role") === "ALL" ? null : formData.get("role"),
      mandatory: formData.get("mandatory") === "on"
    }

    const url = editingTemplate
      ? `/api/admin/event-templates/${editingTemplate.id}`
      : "/api/admin/event-templates"

    const method = editingTemplate ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    if (res.ok) {
      toast({ title: editingTemplate ? "Template atualizado" : "Template criado" })
      setIsDialogOpen(false)
      setEditingTemplate(null)
      loadTemplates()
    } else {
      toast({ title: "Erro ao salvar", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este template?")) return

    const res = await fetch(`/api/admin/event-templates/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast({ title: "Template removido" })
      loadTemplates()
    }
  }

  if (loading) return <div className="p-8">Carregando templates...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Eventos</h1>
          <p className="text-muted-foreground">Gerencie os eventos padrão aplicados automaticamente aos novos colaboradores.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            if (!confirm("Isso irá RECRIAR a agenda de TODOS os colaboradores baseado nos templates atuais. Continuar?")) return

            // Get all users
            const usersRes = await fetch("/api/users")
            if (!usersRes.ok) {
              toast({ title: "Erro ao buscar usuários", variant: "destructive" })
              return
            }
            const users = await usersRes.json()

            let successCount = 0
            for (const user of users) {
              const res = await fetch("/api/admin/calendar/recreate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id })
              })
              if (res.ok) successCount++
            }

            toast({
              title: `Agendas recriadas!`,
              description: `${successCount} de ${users.length} colaboradores atualizados.`
            })
          }}>
            <Users className="mr-2 h-4 w-4" /> Recriar Todas as Agendas
          </Button>
          <Button onClick={() => { setEditingTemplate(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Template
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </div>
                {template.mandatory && (
                  <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                )}
              </div>
              {template.description && (
                <CardDescription className="mt-2">{template.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Dia {template.dayOffset} • {String(template.startHour).padStart(2, '0')}:{String(template.startMinute).padStart(2, '0')} • {template.durationMinutes}min</span>
              </div>

              {template.role && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{template.role}</Badge>
                </div>
              )}

              <Badge className="text-xs">{eventTypeLabels[template.eventType]}</Badge>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingTemplate(template); setIsDialogOpen(true); }}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Editar Template" : "Novo Template"}</DialogTitle>
            <DialogDescription>Configure um evento padrão para novos colaboradores.</DialogDescription>
          </DialogHeader>

          <form id="templateForm" onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título</Label>
                <Input name="title" defaultValue={editingTemplate?.title} required />
              </div>

              <div className="col-span-2">
                <Label>Descrição</Label>
                <Textarea name="description" defaultValue={editingTemplate?.description || ""} />
              </div>

              <div>
                <Label>Tipo de Evento</Label>
                <Select name="eventType" defaultValue={editingTemplate?.eventType || "CUSTOM"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONBOARDING_MEETING">Reunião de Onboarding</SelectItem>
                    <SelectItem value="ONE_ON_ONE">1:1 com Gestor</SelectItem>
                    <SelectItem value="TEAM_INTEGRATION">Integração com Equipe</SelectItem>
                    <SelectItem value="TRAINING_SESSION">Treinamento</SelectItem>
                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Público Alvo</Label>
                <Select name="role" defaultValue={editingTemplate?.role || "ALL"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dia (offset)</Label>
                <Input name="dayOffset" type="number" defaultValue={editingTemplate?.dayOffset || 0} required />
                <p className="text-xs text-muted-foreground mt-1">0 = primeiro dia, 1 = segundo dia, etc.</p>
              </div>

              <div>
                <Label>Hora de Início</Label>
                <div className="flex gap-2">
                  <Input name="startHour" type="number" min="0" max="23" defaultValue={editingTemplate?.startHour || 9} className="w-20" />
                  <span className="self-center">:</span>
                  <Input name="startMinute" type="number" min="0" max="59" defaultValue={editingTemplate?.startMinute || 0} className="w-20" />
                </div>
              </div>

              <div>
                <Label>Duração (minutos)</Label>
                <Input name="durationMinutes" type="number" defaultValue={editingTemplate?.durationMinutes || 60} required />
              </div>

              <div className="col-span-2">
                <Label>Local</Label>
                <Input name="location" defaultValue={editingTemplate?.location || ""} />
              </div>

              <div className="col-span-2">
                <Label>Link da Reunião</Label>
                <Input name="meetingUrl" type="url" defaultValue={editingTemplate?.meetingUrl || ""} />
              </div>

              <div className="col-span-2 flex items-center space-x-2">
                <Checkbox id="mandatory" name="mandatory" defaultChecked={editingTemplate?.mandatory !== false} />
                <Label htmlFor="mandatory" className="cursor-pointer">Evento obrigatório</Label>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button type="submit" form="templateForm">Salvar Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
