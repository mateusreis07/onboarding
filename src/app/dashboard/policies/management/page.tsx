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
import { Plus, Pencil, Trash2, FileText } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Policy {
  id: string
  title: string
  content: string
  mandatory: boolean
  version: string
  isActive: boolean
}

export default function PolicyManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    content: "",
    mandatory: true,
    version: "1.0",
    isActive: true
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || (session.user?.role !== "HR" && session.user?.role !== "MANAGER")) {
      router.push("/dashboard")
    } else {
      fetchPolicies()
    }
  }, [session, status, router])

  async function fetchPolicies() {
    try {
      const res = await fetch("/api/admin/policies")
      if (res.ok) setPolicies(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function handleOpenCreate() {
    setIsEditing(false)
    setFormData({ id: "", title: "", content: "", mandatory: true, version: "1.0", isActive: true })
    setIsDialogOpen(true)
  }

  function handleOpenEdit(policy: Policy) {
    setIsEditing(true)
    setFormData({ ...policy })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    try {
      const url = isEditing ? `/api/admin/policies/${formData.id}` : "/api/admin/policies"
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchPolicies()
        setIsDialogOpen(false)
      } else {
        alert("Erro ao salvar")
      }
    } catch (e) { console.error(e); alert("Erro ao salvar") }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return
    try {
      const res = await fetch(`/api/admin/policies/${id}`, { method: "DELETE" })
      if (res.ok) fetchPolicies()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Políticas</h2>
          <p className="text-muted-foreground">Cadastre e gerencie os documentos e termos da empresa.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Política
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Políticas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma política cadastrada.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Obrigatório</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map(policy => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.title}</TableCell>
                    <TableCell>{policy.version}</TableCell>
                    <TableCell>{policy.mandatory ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {policy.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(policy)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(policy.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Política" : "Nova Política"}</DialogTitle>
            <DialogDescription>Preencha os dados do documento.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Versão</Label>
                <Input value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo (HTML/Markdown)</Label>
              <Textarea className="min-h-[200px]" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
              <p className="text-xs text-muted-foreground">Você pode usar tags HTML básicas para formatar o texto.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="mandatory" checked={formData.mandatory} onCheckedChange={(c) => setFormData({ ...formData, mandatory: c as boolean })} />
                <label htmlFor="mandatory" className="text-sm font-medium">Obrigatório</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="active" checked={formData.isActive} onCheckedChange={(c) => setFormData({ ...formData, isActive: c as boolean })} />
                <label htmlFor="active" className="text-sm font-medium">Ativo</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
