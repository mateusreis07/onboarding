"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, AlertTriangle, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Policy {
  id: string
  title: string
  content: string
  mandatory: boolean
  version: string
  accepted: boolean
  acceptedAt: string | null
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    fetch("/api/policies")
      .then(res => res.json())
      .then(data => {
        setPolicies(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleOpenPolicy = (policy: Policy) => {
    setSelectedPolicy(policy)
    setAgreed(false)
    setIsDialogOpen(true)
  }

  const handleSign = async () => {
    if (!selectedPolicy) return
    setSigning(true)

    try {
      const res = await fetch(`/api/policies/${selectedPolicy.id}/accept`, { method: 'POST' })
      if (res.ok) {
        setPolicies(prev => prev.map(p => p.id === selectedPolicy.id ? { ...p, accepted: true, acceptedAt: new Date().toISOString() } : p))
        toast({ title: "Documento assinado com sucesso", description: "O registro de auditoria foi criado." })
        setIsDialogOpen(false)
      } else {
        toast({ title: "Erro ao assinar", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Erro de conexão", variant: "destructive" })
    }
    setSigning(false)
  }



  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-l-4 border-l-gray-200">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const pendingCount = policies.filter(p => !p.accepted && p.mandatory).length

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jurídico e Compliance</h1>
        <p className="text-muted-foreground">Documentos obrigatórios, termos de uso e políticas internas.</p>
      </div>

      {pendingCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Você possui {pendingCount} documento(s) obrigatório(s) pendente(s) de assinatura.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map(policy => (
          <Card key={policy.id} className={policy.accepted ? "border-green-200 bg-green-50/50" : "border-l-4 border-l-red-500"}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Shield className={policy.accepted ? "h-8 w-8 text-green-500" : "h-8 w-8 text-red-500"} />
                {policy.accepted ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Assinado
                  </Badge>
                ) : (
                  <Badge variant="destructive">Pendente</Badge>
                )}
              </div>
              <CardTitle className="pt-2">{policy.title}</CardTitle>
              <CardDescription>Versão: {policy.version}</CardDescription>
            </CardHeader>
            <CardContent>
              {policy.accepted ? (
                <div className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Assinado em {new Date(policy.acceptedAt!).toLocaleDateString()}
                </div>
              ) : (
                <Button className="w-full" onClick={() => handleOpenPolicy(policy)}>
                  <FileText className="mr-2 h-4 w-4" /> Ler e Assinar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedPolicy?.title}</DialogTitle>
            <DialogDescription>
              Leia atentamente o documento abaixo antes de concordar.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 border rounded-md bg-gray-50 h-[300px]">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedPolicy?.content || "" }} />
          </ScrollArea>

          <div className="flex items-start space-x-2 pt-4">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(c as boolean)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Declaro que li, compreendi e concordo com os termos apresentados neste documento.
              <p className="text-xs text-muted-foreground font-normal mt-1">
                Esta ação será registrada digitalmente com seu IP e data para fins de auditoria.
              </p>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSign} disabled={!agreed || signing}>
              {signing ? "Assinando..." : "Assinar Digitalmente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
