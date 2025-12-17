"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, FileText, Video as VideoIcon, HelpCircle, BookOpen, Upload } from "lucide-react"
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
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Resource {
  id: string
  category: "MANUAL" | "POLICY" | "VIDEO" | "FAQ"
  title: string
  content?: string
  url?: string
  metadata?: string
}

export default function DocumentManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("MANUAL")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    content: "",
    url: "",
    metadata: ""
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || (session.user?.role !== "HR" && session.user?.role !== "MANAGER")) {
      router.push("/dashboard")
    } else {
      fetchResources()
    }
  }, [session, status, router])

  async function fetchResources() {
    try {
      const res = await fetch("/api/admin/resources")
      if (res.ok) setResources(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function handleOpenCreate() {
    setIsEditing(false)
    // Defaults based on tab
    const defaultMeta = activeTab === "VIDEO" ? "10:00" : (activeTab === "MANUAL" || activeTab === "POLICY" ? "1.0 MB" : "")

    setFormData({
      id: "",
      title: "",
      content: "",
      url: "",
      metadata: defaultMeta
    })
    setIsDialogOpen(true)
  }

  function handleOpenEdit(resource: Resource) {
    setIsEditing(true)
    setFormData({
      id: resource.id,
      title: resource.title,
      content: resource.content || "",
      url: resource.url || "",
      metadata: resource.metadata || ""
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    try {
      const url = isEditing ? `/api/admin/resources/${formData.id}` : "/api/admin/resources"
      const method = isEditing ? "PATCH" : "POST"

      const payload = {
        ...formData,
        category: activeTab
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        fetchResources()
        setIsDialogOpen(false)
      } else {
        alert("Erro ao salvar")
      }
    } catch (e) { console.error(e); alert("Erro ao salvar") }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" })
      if (res.ok) fetchResources()
    } catch (e) { console.error(e) }
  }

  // Helper to simulate file upload
  function handleSimulateUpload() {
    setFormData(prev => ({
      ...prev,
      url: "https://example.com/simulated-file.pdf",
      metadata: (Math.random() * 5 + 1).toFixed(1) + " MB" // Random size
    }))
    alert("Arquivo 'carregado' com sucesso (Simulação)")
  }

  const filteredResources = resources.filter(r => r.category === activeTab)

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Recursos</h2>
          <p className="text-muted-foreground">Gerencie a biblioteca de documentos, vídeos e FAQs disponíveis para os colaboradores.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="MANUAL" className="flex gap-2"><BookOpen className="h-4 w-4" /> Manuais e Guias</TabsTrigger>
          <TabsTrigger value="POLICY" className="flex gap-2"><FileText className="h-4 w-4" /> Políticas Internas</TabsTrigger>
          <TabsTrigger value="VIDEO" className="flex gap-2"><VideoIcon className="h-4 w-4" /> Vídeos</TabsTrigger>
          <TabsTrigger value="FAQ" className="flex gap-2"><HelpCircle className="h-4 w-4" /> FAQ</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {activeTab === "MANUAL" && "Manuais e Guias"}
                {activeTab === "POLICY" && "Políticas da Biblioteca"}
                {activeTab === "VIDEO" && "Vídeos de Integração"}
                {activeTab === "FAQ" && "Perguntas Frequentes"}
              </CardTitle>
              <CardDescription>
                {activeTab === "POLICY" ? "Documentos informativos na biblioteca (não requerem assinatura)." : "Gerencie os itens desta categoria."}
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" /> Adicionar Novo</Button>
          </CardHeader>
          <CardContent>
            {filteredResources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum item encontrado nesta categoria.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{activeTab === "FAQ" ? "Pergunta" : "Título"}</TableHead>
                    {activeTab !== "FAQ" && <TableHead>{activeTab === "VIDEO" ? "Duração" : "Tamanho"}</TableHead>}
                    {activeTab === "FAQ" && <TableHead>Resposta</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map(res => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">{res.title}</TableCell>

                      {activeTab !== "FAQ" && (
                        <TableCell>{res.metadata || "-"}</TableCell>
                      )}

                      {activeTab === "FAQ" && (
                        <TableCell className="max-w-md truncate">{res.content}</TableCell>
                      )}

                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(res)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(res.id)}>
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
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Item" : "Novo Item"}</DialogTitle>
            <DialogDescription>
              {activeTab === "FAQ" ? "Adicione uma pergunta e resposta." : "Preencha os detalhes do arquivo/vídeo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{activeTab === "FAQ" ? "Pergunta" : "Título"}</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>

            {activeTab === "FAQ" ? (
              <div className="space-y-2">
                <Label>Resposta</Label>
                <Textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={4} />
              </div>
            ) : (
              <>
                {activeTab === "VIDEO" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duração</Label>
                      <Input value={formData.metadata} onChange={e => setFormData({ ...formData, metadata: e.target.value })} placeholder="ex: 10:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>URL do Vídeo</Label>
                      <Input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  // File Upload Simulation for Manual/Policy
                  <div className="space-y-2">
                    <Label>Arquivo</Label>
                    <div className="flex gap-2">
                      <Input value={formData.url || "Nenhum arquivo selecionado"} readOnly className="bg-gray-50" />
                      <Button variant="outline" onClick={handleSimulateUpload} type="button">
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Tamanho simulado: {formData.metadata}
                    </div>
                  </div>
                )}
              </>
            )}
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
