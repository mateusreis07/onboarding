"use client"

import { useEffect, useState } from "react"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Users, Briefcase, Building2, Plus, Pencil, Trash2, Lock, Shield } from "lucide-react"

interface SystemItem {
  id: string
  code: string
  label: string
  description?: string | null
  category?: string | null
  isActive: boolean
  isSystem: boolean
  userCount?: number
  templateCount?: number
  createdAt: string
  updatedAt: string
}

export default function SystemConfigPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [roles, setRoles] = useState<SystemItem[]>([])
  const [departments, setDepartments] = useState<SystemItem[]>([])
  const [jobTitles, setJobTitles] = useState<SystemItem[]>([])

  const [activeTab, setActiveTab] = useState("roles")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    label: "",
    description: "",
    category: "",
    isActive: true,
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "HR") {
      router.push("/dashboard")
      return
    }
    fetchData()
  }, [session, status, router])

  async function fetchData() {
    setLoading(true)
    try {
      const [rolesRes, deptRes, jtRes] = await Promise.all([
        fetch("/api/admin/system/roles"),
        fetch("/api/admin/system/departments"),
        fetch("/api/admin/system/jobtitles"),
      ])

      if (rolesRes.ok) setRoles(await rolesRes.json())
      if (deptRes.ok) setDepartments(await deptRes.json())
      if (jtRes.ok) setJobTitles(await jtRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function getApiPath() {
    switch (activeTab) {
      case "roles": return "/api/admin/system/roles"
      case "departments": return "/api/admin/system/departments"
      case "jobtitles": return "/api/admin/system/jobtitles"
      default: return ""
    }
  }

  function openCreateDialog() {
    setIsEditing(false)
    setFormData({
      id: "",
      code: "",
      label: "",
      description: "",
      category: "",
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(item: SystemItem) {
    setIsEditing(true)
    setFormData({
      id: item.id,
      code: item.code,
      label: item.label,
      description: item.description || "",
      category: item.category || "",
      isActive: item.isActive,
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.code || !formData.label) {
      alert("Código e Nome são obrigatórios")
      return
    }

    setSaving(true)
    try {
      const basePath = getApiPath()
      const url = isEditing ? `${basePath}/${formData.id}` : basePath
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsDialogOpen(false)
        fetchData()
      } else {
        const errorText = await res.text()
        alert(errorText || "Erro ao salvar")
      }
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: SystemItem) {
    if (item.isSystem) {
      alert("Itens do sistema não podem ser deletados")
      return
    }

    const itemName = activeTab === "roles" ? "função" : activeTab === "departments" ? "departamento" : "cargo"

    if (!confirm(`Tem certeza que deseja deletar ${itemName} "${item.label}"?`)) {
      return
    }

    try {
      const basePath = getApiPath()
      const res = await fetch(`${basePath}/${item.id}`, { method: "DELETE" })

      if (res.ok) {
        fetchData()
      } else {
        const errorText = await res.text()
        alert(errorText || "Erro ao deletar")
      }
    } catch (e) {
      console.error(e)
      alert("Erro ao deletar")
    }
  }

  function getTabTitle() {
    switch (activeTab) {
      case "roles": return "Função"
      case "departments": return "Departamento"
      case "jobtitles": return "Cargo"
      default: return "Item"
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2">
        <Loader2 className="animate-spin" /> Carregando configurações...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h2>
          <p className="text-muted-foreground">
            Gerencie funções, departamentos e cargos
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/settings/permissions")}>
          <Shield className="mr-2 h-4 w-4" />
          Gerenciar Permissões
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" className="flex gap-2">
            <Users className="h-4 w-4" /> Funções ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex gap-2">
            <Building2 className="h-4 w-4" /> Departamentos ({departments.length})
          </TabsTrigger>
          <TabsTrigger value="jobtitles" className="flex gap-2">
            <Briefcase className="h-4 w-4" /> Cargos ({jobTitles.length})
          </TabsTrigger>
        </TabsList>

        {/* ROLES TAB */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Funções do Sistema</CardTitle>
                <CardDescription>
                  Funções determinam o nível de acesso dos usuários. Configure permissões em "Gerenciar Permissões".
                </CardDescription>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> Nova Função
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Usuários</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {role.label}
                          {role.isSystem && (
                            <span title="Item do sistema">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{role.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{role.userCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(role)}
                          disabled={role.isSystem}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEPARTMENTS TAB */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Departamentos</CardTitle>
                <CardDescription>
                  Organize colaboradores por área de atuação.
                </CardDescription>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> Novo Departamento
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Colaboradores</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {dept.label}
                          {dept.isSystem && (
                            <span title="Item do sistema">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{dept.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={dept.isActive ? "default" : "secondary"}>
                          {dept.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{dept.userCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(dept)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(dept)}
                          disabled={dept.isSystem}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* JOB TITLES TAB */}
        <TabsContent value="jobtitles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cargos</CardTitle>
                <CardDescription>
                  Cargos categorizam colaboradores e templates de onboarding.
                </CardDescription>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> Novo Cargo
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Uso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobTitles.map((jt) => (
                    <TableRow key={jt.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {jt.label}
                          {jt.isSystem && (
                            <span title="Item do sistema">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{jt.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{jt.category || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={jt.isActive ? "default" : "secondary"}>
                          {jt.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Badge variant="outline" title="Colaboradores">
                            <Users className="h-3 w-3 mr-1" />
                            {jt.userCount || 0}
                          </Badge>
                          <Badge variant="outline" title="Templates">
                            {jt.templateCount || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(jt)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(jt)}
                          disabled={jt.isSystem}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Editar ${getTabTitle()}` : `Nova ${getTabTitle()}`}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Atualize as informações do(a) ${getTabTitle().toLowerCase()}.`
                : `Preencha os dados para criar um(a) novo(a) ${getTabTitle().toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z_]/g, '') })}
                  placeholder="EX: NOVO_CODIGO"
                  disabled={isEditing && formData.id ? true : false}
                />
                <p className="text-xs text-muted-foreground">
                  Apenas letras maiúsculas e underscores
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Nome *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Nome de exibição"
                />
              </div>
            </div>

            {activeTab === "jobtitles" && (
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="ex: Engenharia, Financeiro, Marketing..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição opcional..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
