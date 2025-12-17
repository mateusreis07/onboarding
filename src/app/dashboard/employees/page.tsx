"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserPlus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  jobTitle?: string
  managerId?: string | null
  manager?: {
    id: string
    name: string
  }
  buddyId?: string | null
  buddy?: {
    id: string
    name: string
  }
  onboarding?: {
    status: string
    progress: number
  }
}

interface Template {
  id: string
  title: string
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

const statusTranslations: Record<string, string> = {
  "COMPLETED": "CONCLUÍDO",
  "IN_PROGRESS": "EM ANDAMENTO",
  "PENDING": "PENDENTE"
}

export default function EmployeesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [managers, setManagers] = useState<{ id: string, name: string }[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [systemOptions, setSystemOptions] = useState<SystemOptions>({
    roles: [],
    departments: [],
    jobTitles: [],
    jobTitlesByCategory: {}
  })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    jobTitle: "",
    managerId: "",
    buddyId: "",
    templateId: ""
  })

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "password123", // Default for now
    role: "EMPLOYEE",
    department: "",
    jobTitle: "",
    managerId: "",
    buddyId: "",
    templateId: "",
    startDate: new Date().toISOString().split('T')[0]
  })

  // Helper functions to get labels
  const getRoleLabel = (code: string) => {
    const role = systemOptions.roles.find(r => r.code === code)
    return role?.label || code
  }

  const getDepartmentLabel = (code: string) => {
    const dept = systemOptions.departments.find(d => d.code === code)
    return dept?.label || code
  }

  const getJobTitleLabel = (code: string) => {
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
      const [usersRes, templatesRes, managersRes, optionsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/templates"),
        fetch("/api/managers"),
        fetch("/api/system-options")
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (templatesRes.ok) setTemplates(await templatesRes.json())
      if (managersRes.ok) setManagers(await managersRes.json())
      if (optionsRes.ok) {
        const options = await optionsRes.json()
        setSystemOptions(options)
        // Set default department if available
        if (options.departments.length > 0 && !newUser.department) {
          setNewUser(prev => ({ ...prev, department: options.departments[0].code }))
        }
      }

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUser() {
    try {
      const payload = { ...newUser }
      if (payload.templateId === "none") delete (payload as any).templateId // Clean up
      if (payload.managerId === "none" || payload.managerId === "") delete (payload as any).managerId
      if (payload.buddyId === "none" || payload.buddyId === "") delete (payload as any).buddyId


      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsDialogOpen(false)
        alert(`Usuário criado com sucesso!\n\nEnvie as credenciais para o colaborador:\nE-mail: ${payload.email}\nSenha: ${payload.password}`)

        setNewUser({
          name: "",
          email: "",
          password: "password123",
          role: "EMPLOYEE",
          department: "ENGINEERING",
          jobTitle: "",
          managerId: "",
          buddyId: "",
          templateId: "",
          startDate: new Date().toISOString().split('T')[0]
        })
        fetchData()
      } else if (res.status === 409) {
        alert("Este e-mail já está cadastrado no sistema. Use outro e-mail.")
      } else {
        const errorText = await res.text()
        alert(`Falha ao criar usuário: ${errorText}`)
      }
    } catch (e) {
      console.error(e)
      alert("Erro inesperado ao criar usuário")
    }
  }

  function handleViewDetails(user: User) {
    setSelectedUser(user)
    setIsEditMode(false)
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      jobTitle: user.jobTitle || "",
      managerId: user.managerId || "",
      buddyId: user.buddyId || "",
      templateId: ""
    })
    setIsDetailsDialogOpen(true)
  }

  async function handleSaveEdit() {
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
          department: editFormData.department || null,
          jobTitle: editFormData.jobTitle || null,
          managerId: (editFormData.managerId && editFormData.managerId !== "none") ? editFormData.managerId : null,
          buddyId: (editFormData.buddyId && editFormData.buddyId !== "none") ? editFormData.buddyId : null,
        })
      })

      if (res.ok) {
        const updatedUser = await res.json()
        setSelectedUser(updatedUser)
        setIsEditMode(false)
        fetchData() // Refresh the list
        alert("Colaborador atualizado com sucesso!")
      } else if (res.status === 409) {
        alert("Este e-mail já está em uso por outro usuário.")
      } else {
        const errorText = await res.text()
        alert(`Falha ao atualizar: ${errorText}`)
      }
    } catch (e) {
      console.error(e)
      alert("Erro inesperado ao atualizar colaborador")
    }
  }

  async function handleAssignTemplate() {
    if (!selectedUser || !editFormData.templateId || editFormData.templateId === "none") {
      alert("Selecione um template válido")
      return
    }

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: editFormData.templateId
        })
      })

      if (res.ok) {
        alert("Template de onboarding atribuído com sucesso!")
        fetchData() // Refresh the list
        setIsDetailsDialogOpen(false)
      } else {
        const errorText = await res.text()
        alert(`Falha ao atribuir template: ${errorText}`)
      }
    } catch (e) {
      console.error(e)
      alert("Erro inesperado ao atribuir template")
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Colaboradores</h2>
          <p className="text-muted-foreground">Gerencie usuários do sistema e acompanhe o status de onboarding.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
              <DialogDescription>
                Crie uma nova conta de usuário e opcionalmente atribua um plano de onboarding.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
              </div>

              {/* Login & Start Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Senha Inicial</Label>
                  <Input
                    type="text"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Defina uma senha provisória"
                  />
                  <p className="text-[10px] text-muted-foreground">Informe ao colaborador.</p>
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={newUser.startDate}
                    onChange={e => setNewUser({ ...newUser, startDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select value={newUser.department} onValueChange={v => setNewUser({ ...newUser, department: v })}>
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
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Select value={newUser.jobTitle} onValueChange={v => setNewUser({ ...newUser, jobTitle: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
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

              {/* Roles & Management */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Função (Acesso)</Label>
                  <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systemOptions.roles.map(role => (
                        <SelectItem key={role.code} value={role.code}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gestor</Label>
                  <Select value={newUser.managerId} onValueChange={v => setNewUser({ ...newUser, managerId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem gestor</SelectItem>
                      {managers.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Padrinho</Label>
                  <Select value={newUser.buddyId} onValueChange={v => setNewUser({ ...newUser, buddyId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem padrinho</SelectItem>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Onboarding Template */}
              <div className="space-y-2 pt-2 border-t">
                <Label>Template de Onboarding</Label>
                <Select value={newUser.templateId} onValueChange={v => setNewUser({ ...newUser, templateId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem onboarding necessário</SelectItem>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Selecionar um template irá gerar tarefas imediatamente.</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateUser}>Criar e Convidar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Status do Onboarding</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{getRoleLabel(user.role)}</Badge></TableCell>
                  <TableCell>{getDepartmentLabel(user.department || "") || "-"}</TableCell>
                  <TableCell>
                    {user.onboarding ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={user.onboarding.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {statusTranslations[user.onboarding.status] || user.onboarding.status}
                          </Badge>
                          <span className="text-muted-foreground">{user.onboarding.progress}%</span>
                        </div>
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${user.onboarding.progress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(user)}>Detalhes</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Colaborador</DialogTitle>
            <DialogDescription>
              Informações completas sobre o colaborador e seu progresso de onboarding.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Informações Pessoais</h3>
                  {!isEditMode && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                      Editar
                    </Button>
                  )}
                </div>
                <div className="space-y-6 py-4">
                  {/* Personal & Account Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nome Completo</Label>
                      {isEditMode ? (
                        <Input
                          value={editFormData.name}
                          onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <p className="font-medium text-base">{selectedUser.name}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">ID do Usuário</Label>
                      <p className="font-mono text-xs text-muted-foreground pt-1">{selectedUser.id}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">E-mail</Label>
                      {isEditMode ? (
                        <Input
                          type="email"
                          value={editFormData.email}
                          onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <p className="font-medium text-sm">{selectedUser.email}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Função (Acesso)</Label>
                      {isEditMode ? (
                        <Select value={editFormData.role} onValueChange={v => setEditFormData({ ...editFormData, role: v })}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {systemOptions.roles.map(role => (
                              <SelectItem key={role.code} value={role.code}>{role.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div><Badge variant="outline">{getRoleLabel(selectedUser.role)}</Badge></div>
                      )}
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Departamento</Label>
                      {isEditMode ? (
                        <Select value={editFormData.department} onValueChange={v => setEditFormData({ ...editFormData, department: v })}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {systemOptions.departments.map(dept => (
                              <SelectItem key={dept.code} value={dept.code}>{dept.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-sm">
                          {getDepartmentLabel(selectedUser.department || "") || "-"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Cargo</Label>
                      {isEditMode ? (
                        <Select value={editFormData.jobTitle} onValueChange={v => setEditFormData({ ...editFormData, jobTitle: v })}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
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
                      ) : (
                        <p className="font-medium text-sm">{selectedUser.jobTitle ? getJobTitleLabel(selectedUser.jobTitle) : "-"}</p>
                      )}
                    </div>
                  </div>

                  {/* Management */}
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gestor</Label>
                      {isEditMode ? (
                        <Select value={editFormData.managerId} onValueChange={v => setEditFormData({ ...editFormData, managerId: v })}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem gestor</SelectItem>
                            {managers.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-sm">{selectedUser.manager?.name || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Padrinho</Label>
                      {isEditMode ? (
                        <Select value={editFormData.buddyId} onValueChange={v => setEditFormData({ ...editFormData, buddyId: v })}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem padrinho</SelectItem>
                            {users.filter(u => u.id !== selectedUser.id).map(u => (
                              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-sm">{selectedUser.buddy?.name || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>
                {isEditMode && (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
                    <Button variant="outline" onClick={() => {
                      setIsEditMode(false)
                      setEditFormData({
                        name: selectedUser.name,
                        email: selectedUser.email,
                        role: selectedUser.role,
                        department: selectedUser.department || "",
                        jobTitle: selectedUser.jobTitle || "",
                        managerId: selectedUser.managerId || "",
                        buddyId: selectedUser.buddyId || "",
                        templateId: ""
                      })
                    }}>
                      Cancelar
                    </Button>
                  </div>
                )}


                {/* Onboarding Status */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Status de Onboarding</h3>
                  {selectedUser.onboarding ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={selectedUser.onboarding.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {statusTranslations[selectedUser.onboarding.status] || selectedUser.onboarding.status}
                          </Badge>
                          <span className="text-2xl font-bold">{selectedUser.onboarding.progress}%</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${selectedUser.onboarding.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.onboarding.progress === 100
                          ? "Onboarding concluído com sucesso!"
                          : `Faltam ${100 - selectedUser.onboarding.progress}% para concluir o onboarding.`}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Este colaborador não possui um plano de onboarding atribuído.</p>
                    </div>
                  )}
                </div>

                {/* Template Assignment */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">
                    {selectedUser.onboarding ? "Alterar Template de Onboarding" : "Atribuir Template de Onboarding"}
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Selecione um Template</Label>
                      <Select
                        value={editFormData.templateId}
                        onValueChange={v => setEditFormData({ ...editFormData, templateId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um template..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum template</SelectItem>
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAssignTemplate}
                      disabled={!editFormData.templateId || editFormData.templateId === "none"}
                      className="w-full"
                    >
                      {selectedUser.onboarding ? "Alterar Template" : "Atribuir Template"}
                    </Button>
                    {selectedUser.onboarding && (
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Atenção: Alterar o template irá substituir todas as tarefas atuais de onboarding por novas tarefas do template selecionado.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                    Fechar
                  </Button>
                  {selectedUser.onboarding && (
                    <Button onClick={() => {
                      setIsDetailsDialogOpen(false)
                      // Navigate to tasks page - you can implement this later
                      window.location.href = '/dashboard/tasks'
                    }}>
                      Ver Tarefas
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
