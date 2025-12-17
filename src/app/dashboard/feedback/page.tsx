"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { BarChart, Activity, TrendingUp, User, Calendar, BrainCircuit } from "lucide-react"
import { useSession } from "next-auth/react"

interface Feedback {
  id: string
  type: 'DAY_7' | 'DAY_30' | 'DAY_90'
  content: string // JSON
  aiSummary: string | null
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null
  score: number | null
  createdAt: string
  user: { name: string, email: string }
  evaluator: { name: string }
}

const feedbackTypeLabels: Record<string, string> = {
  DAY_7: "7 Dias - Primeira Semana",
  DAY_30: "30 Dias - Mensal",
  DAY_90: "90 Dias - Experiência"
}

export default function FeedbackPage() {
  const { data: session } = useSession()
  const isManager = session?.user?.role === 'HR' || session?.user?.role === 'MANAGER'

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([]) // For selecting user to evaluate

  // Form State
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedType, setSelectedType] = useState<string>("DAY_7")
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    loadFeedbacks()
    if (isManager) loadUsers()
  }, [isManager])

  const loadFeedbacks = () => {
    fetch("/api/feedback")
      .then(res => res.json())
      .then(data => {
        setFeedbacks(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const loadUsers = () => {
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error)
  }

  const handleSubmit = async () => {
    if (!selectedUser || !selectedType) return

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser,
        type: selectedType,
        content: answers
      })
    })

    if (res.ok) {
      toast({ title: "Feedback enviado e processado pela IA!" })
      setIsDialogOpen(false)
      loadFeedbacks()
    } else {
      toast({ title: "Erro ao enviar feedback", variant: "destructive" })
    }
  }

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }))
  }

  // Define questions based on type
  const getQuestions = (type: string) => {
    switch (type) {
      case 'DAY_7': return [
        "Como foi a adaptação inicial do colaborador?",
        "O colaborador demonstra entendimento da cultura da empresa?",
        "As ferramentas e acessos foram disponibilizados corretamente?"
      ]
      case 'DAY_30': return [
        "Como está a entrega das tarefas iniciais?",
        "O colaborador interage bem com a equipe?",
        "Existem pontos de dificuldade técnica?"
      ]
      case 'DAY_90': return [
        "O colaborador atingiu as expectativas do período de experiência?",
        "Quais foram os principais pontos fortes demonstrados?",
        "O colaborador deve ser efetivado? Por que?"
      ]
      default: return []
    }
  }



  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-5 w-32 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avaliações e Feedback</h1>
          <p className="text-muted-foreground">Acompanhamento de performance e análise de sentimento com IA.</p>
        </div>
        {isManager && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Activity className="mr-2 h-4 w-4" /> Nova Avaliação
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {feedbacks.map(feedback => (
          <Card key={feedback.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline">{feedbackTypeLabels[feedback.type]}</Badge>
                {feedback.sentiment === 'POSITIVE' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Positivo</Badge>}
                {feedback.sentiment === 'NEUTRAL' && <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Neutro</Badge>}
                {feedback.sentiment === 'NEGATIVE' && <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Negativo</Badge>}
              </div>
              <CardTitle className="mt-2 text-lg">
                {feedback.user.name}
              </CardTitle>
              <CardDescription>
                Avaliado por {feedback.evaluator.name} em {new Date(feedback.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {/* IA Analysis Section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                  <BrainCircuit className="h-4 w-4" />
                  Análise da IA
                </div>
                <p className="text-sm text-slate-600">
                  {feedback.aiSummary || "Processando..."}
                </p>
                {feedback.score !== null && (
                  <div className="mt-2 text-xs font-semibold text-slate-500">
                    Score de Performance: {feedback.score}/100
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Evaluation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
            <DialogDescription>Preencha os dados abaixo. A IA analisará as respostas automaticamente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Colaborador</Label>
                <Select onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Avaliação</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY_7">7 Dias (1ª Semana)</SelectItem>
                    <SelectItem value="DAY_30">30 Dias (Mensal)</SelectItem>
                    <SelectItem value="DAY_90">90 Dias (Final)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 mt-4 border-t pt-4">
              {getQuestions(selectedType).map((q, idx) => (
                <div key={idx}>
                  <Label className="mb-2 block">{q}</Label>
                  <Textarea
                    placeholder="Descreva detalhadamente..."
                    onChange={(e) => handleAnswerChange(q, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit}>Enviar Avaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
