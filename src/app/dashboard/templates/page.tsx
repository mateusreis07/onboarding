"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface Template {
  id: string
  title: string
  description?: string
  jobTitle?: string
  _count: {
    tasks: number
  }
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

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ title: "", description: "", jobTitle: "", department: "" })
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
      fetchData()
    }
  }, [session])

  async function fetchData() {
    try {
      const [templatesRes, optionsRes] = await Promise.all([
        fetch("/api/templates"),
        fetch("/api/system-options")
      ])
      if (templatesRes.ok) setTemplates(await templatesRes.json())
      if (optionsRes.ok) setSystemOptions(await optionsRes.json())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate)
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setNewTemplate({ title: "", description: "", jobTitle: "", department: "" })
        fetchData()
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates de Onboarding</h2>
          <p className="text-muted-foreground">Gerencie planos de onboarding para diferentes cargos e departamentos.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
              <DialogDescription>
                Defina um novo template de onboarding. Você pode adicionar tarefas após criá-lo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jobTitle" className="text-right">
                  Cargo
                </Label>
                <Select value={newTemplate.jobTitle} onValueChange={v => setNewTemplate({ ...newTemplate, jobTitle: v })}>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Departamento
                </Label>
                <div className="col-span-3">
                  <Select value={newTemplate.department} onValueChange={(val) => setNewTemplate({ ...newTemplate, department: val })}>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Templates</CardTitle>
          <CardDescription>
            Uma lista de todos os templates de onboarding ativos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Carregando...</div>
          ) : templates.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">Nenhum template encontrado. Crie um acima.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Cargo Alvo</TableHead>
                  <TableHead>Tarefas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>{getJobTitleLabel(template.jobTitle || "")}</TableCell>
                    <TableCell>{template._count?.tasks || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/templates/${template.id}`)}>Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
