"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, Clock, XCircle, PenTool, Eye, BookOpen, PlayCircle, HelpCircle, Download, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Document {
  id: string
  title: string
  url: string
  type: string
  status: string
  createdAt: string
}

interface LibraryResource {
  id: string
  category: string
  title: string
  content?: string
  url?: string
  metadata?: string
}

function formatMetadata(metadata?: string, category?: string): string {
  if (!metadata) return ""

  try {
    const data = JSON.parse(metadata)

    // Format based on category
    if (category === 'MANUAL') {
      const parts = []
      if (data.author) parts.push(`Autor: ${data.author}`)
      if (data.version) parts.push(`Versão ${data.version}`)
      if (data.pages) parts.push(`${data.pages} páginas`)
      if (data.targetAudience) parts.push(data.targetAudience)
      return parts.join(' • ')
    }

    if (category === 'POLICY') {
      const parts = []
      if (data.department) parts.push(data.department)
      if (data.mandatory) parts.push('Obrigatório')
      if (data.effectiveDate) parts.push(`Vigência: ${new Date(data.effectiveDate).toLocaleDateString('pt-BR')}`)
      if (data.maxAmount) parts.push(data.maxAmount)
      return parts.join(' • ')
    }

    if (category === 'VIDEO') {
      const parts = []
      if (data.duration) parts.push(data.duration)
      if (data.speaker) parts.push(`com ${data.speaker}`)
      if (data.mandatory) parts.push('Obrigatório')
      return parts.join(' • ')
    }

    if (category === 'FAQ') {
      const parts = []
      if (data.questions) parts.push(`${data.questions} perguntas`)
      if (data.department) parts.push(data.department)
      if (data.targetAudience) parts.push(data.targetAudience)
      return parts.join(' • ')
    }

    return ""
  } catch (e) {
    return ""
  }
}




export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [libraryResources, setLibraryResources] = useState<LibraryResource[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedDocForUpload, setSelectedDocForUpload] = useState<Document | null>(null)
  const [viewDoc, setViewDoc] = useState<Document | null>(null)
  const [uploadData, setUploadData] = useState({ title: "" })
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents")
      if (res.ok) {
        setDocuments(await res.json())
      }

      const resResources = await fetch("/api/resources")
      if (resResources.ok) {
        setLibraryResources(await resResources.json())
      }

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function openUploadDialog(doc?: Document) {
    if (doc) {
      setSelectedDocForUpload(doc)
      setUploadData({ title: doc.title })
    } else {
      setSelectedDocForUpload(null)
      setUploadData({ title: "" })
    }
    setIsDialogOpen(true)
  }

  function openSignDialog(doc: Document) {
    setSelectedDocForUpload(doc)
    setIsSignDialogOpen(true)
  }

  function openViewDialog(doc: Document) {
    setViewDoc(doc)
    setIsViewDialogOpen(true)
  }

  const handleUpload = async () => {
    if (!uploadData.title) return;

    setIsProcessing(true)
    try {
      if (selectedDocForUpload) {
        // UPDATE: Decide status based on file content/title logic
        // If contract -> SIGNATURE_PENDING, else APPROVED
        const isContract = selectedDocForUpload.title.toLowerCase().includes('contrato') || selectedDocForUpload.title.toLowerCase().includes('termo')
        const newStatus = isContract ? 'SIGNATURE_PENDING' : 'APPROVED'

        await fetch(`/api/documents/${selectedDocForUpload.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus, title: uploadData.title })
        })
      } else {
        // CREATE NEW
        await fetch('/api/documents', {
          method: 'POST',
          body: JSON.stringify({
            title: uploadData.title,
            type: 'PDF',
            url: 'http://example.com/mock-doc'
          })
        })
      }
      await fetchDocuments()
      setIsDialogOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }



  const handleSign = async () => {
    if (!selectedDocForUpload) return
    setIsProcessing(true)
    try {
      await fetch(`/api/documents/${selectedDocForUpload.id}`, {
        method: 'PATCH',
        // Use SIGNED state for backend logic, treat as Approved/Completed in UI
        body: JSON.stringify({ status: 'SIGNED' })
      })
      await fetchDocuments()
      setIsSignDialogOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const pendingCount = documents.filter(d => ['PENDING', 'REJECTED', 'SIGNATURE_PENDING'].includes(d.status)).length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos e Recursos</h1>
        <p className="text-muted-foreground">Gerencie seus arquivos e acesse a biblioteca corporativa.</p>
      </div>

      {pendingCount > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-700">Atenção Requerida</AlertTitle>
          <AlertDescription className="text-red-600">
            Você possui {pendingCount} documento(s) pendente(s) de envio ou correção. Verifique a aba "Meus Envios".
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="library" className="space-y-4">
        <TabsList>
          <TabsTrigger value="library">Biblioteca & Recursos</TabsTrigger>
          <TabsTrigger value="personal" className="relative flex items-center gap-2">
            Meus Envios
            {pendingCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6 animate-in fade-in-50">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Manuais e Guias
                </CardTitle>
                <CardDescription>Documentação essencial para o dia a dia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {libraryResources.filter(r => r.category === 'MANUAL').length === 0 ? <div className="text-sm text-muted-foreground">Nenhum manual disponível.</div> : libraryResources.filter(r => r.category === 'MANUAL').map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-red-100 text-red-600 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{formatMetadata(item.metadata, item.category) || "Manual"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => window.open(item.url || '#', '_blank')}><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Políticas Internas
                </CardTitle>
                <CardDescription>Regras e diretrizes da empresa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {libraryResources.filter(r => r.category === 'POLICY').length === 0 ? <div className="text-sm text-muted-foreground">Nenhuma política disponível.</div> : libraryResources.filter(r => r.category === 'POLICY').map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-slate-100 text-slate-600 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{formatMetadata(item.metadata, item.category) || "Política"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => window.open(item.url || '#', '_blank')}><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" /> Vídeos de Integração e Tutoriais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {libraryResources.filter(r => r.category === 'VIDEO').length === 0 ? <div className="text-sm text-muted-foreground">Nenhum vídeo disponível.</div> : libraryResources.filter(r => r.category === 'VIDEO').map((video, i) => (
                  <div key={video.id} className="group relative rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => window.open(video.url || '#', '_blank')}>
                    <div className="aspect-video bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <PlayCircle className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950">
                      <h3 className="font-medium text-sm line-clamp-1">{video.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{formatMetadata(video.metadata, video.category)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> Perguntas (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {libraryResources.filter(r => r.category === 'FAQ').length === 0 ? <div className="text-sm text-muted-foreground">Nenhuma pergunta disponível.</div> : libraryResources.filter(r => r.category === 'FAQ').map((item, i) => (
                  <div key={item.id} className="border rounded-lg px-4 py-2">
                    <button
                      className="flex items-center justify-between w-full text-left font-medium text-sm py-2"
                      onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    >
                      {item.title}
                      {openFaqIndex === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {openFaqIndex === i && (
                      <div className="pb-2 text-sm text-muted-foreground animate-in slide-in-from-top-1">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="animate-in fade-in-50">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meus Documentos</CardTitle>
                  <CardDescription>Envie os documentos solicitados pelo RH.</CardDescription>
                </div>
                <Button onClick={() => openUploadDialog()}><Upload className="mr-2 h-4 w-4" /> Enviar Documento</Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Carregando...</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">Nenhum documento solicitado no momento.</div>
                  <Button variant="outline" onClick={() => openUploadDialog()}>Enviar meu primeiro documento</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {(doc.status === 'APPROVED' || doc.status === 'SIGNED') && <Badge variant="default" className="bg-green-600">Concluído</Badge>}
                            {doc.status === 'REJECTED' && <Badge variant="destructive">Recusado</Badge>}
                            {doc.status === 'PENDING' && <Badge variant="secondary">Pendente Envio</Badge>}
                            {doc.status === 'SIGNATURE_PENDING' && <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Assinatura Pendente</Badge>}

                            <span className="text-xs text-muted-foreground">
                              Criado em {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        {doc.status === 'PENDING' || doc.status === 'REJECTED' ? (
                          <Button variant={doc.status === 'REJECTED' ? 'destructive' : 'default'} size="sm" onClick={() => openUploadDialog(doc)}>
                            <Upload className="mr-2 h-3 w-3" /> {doc.status === 'REJECTED' ? 'Corrigir' : 'Enviar'}
                          </Button>
                        ) : doc.status === 'SIGNATURE_PENDING' ? (
                          <div className="flex gap-1">
                            <Button variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200" size="sm" onClick={() => openSignDialog(doc)}>
                              <PenTool className="mr-2 h-3 w-3" /> Assinar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openUploadDialog(doc)} title="Alterar arquivo">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openUploadDialog(doc)} title="Substituir documento">
                            <PenTool className="mr-2 h-3 w-3" /> Substituir
                          </Button>
                        )}

                        {doc.status !== 'PENDING' && (
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDocForUpload ? 'Enviar/Atualizar Documento' : 'Novo Documento'}</DialogTitle>
            <DialogDescription>
              {selectedDocForUpload ? `Envie um arquivo para: ${selectedDocForUpload.title}` : 'Preencha os dados abaixo.'}
              {isProcessing && <div className="mt-2 text-xs text-blue-600">Processando envio...</div>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Documento</Label>
              <Input
                value={uploadData.title}
                onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                placeholder="Ex: RG, CPF, Contrato..."
                disabled={!!selectedDocForUpload || isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <Input type="file" disabled={isProcessing} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpload} disabled={isProcessing}>
              {isProcessing ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assinar Documento</DialogTitle>
            <DialogDescription>
              Você está assinando digitalmente: <b>{selectedDocForUpload?.title}</b>
              {isProcessing && <div className="mt-2 text-xs text-blue-600">Processando assinatura...</div>}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            <div className="p-4 border-2 border-dashed rounded-lg w-full text-center bg-slate-50">
              <p className="text-sm text-slate-500 mb-2">Área de Assinatura Digital</p>
              <div className="h-20 bg-white border rounded flex items-center justify-center">
                <span className="text-4xl font-serif italic text-slate-800 opacity-50">Assinatura...</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSign} disabled={isProcessing}>
              {isProcessing ? 'Assinando...' : 'Confirmar Assinatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{viewDoc?.title}</DialogTitle>
            <DialogDescription>
              Visualizando documento ({viewDoc?.status})
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 rounded-lg flex items-center justify-center border overflow-hidden m-4">
            <div className="text-center">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">Pré-visualização do Documento</p>
              <p className="text-xs text-slate-400 mt-1">Este é um mock de visualização.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            <Button onClick={() => {
              // Fake download
              setIsViewDialogOpen(false)
            }}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
