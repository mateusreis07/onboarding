"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Save, Trash, GripVertical, FileText, Video, Edit } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Question {
  text: string
  options: string[]
  correctAnswer: number
}

interface Module {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  order: number
  quiz?: {
    questions: { id: string, text: string, options: string, correctAnswer: number }[]
  }
}

interface Course {
  id: string
  title: string
  description: string | null
  role: string | null
  modules: Module[]
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  // Module Editing State
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null) // null = new

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [hasQuiz, setHasQuiz] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/trainings/${params.courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data)
        setLoading(false)
      })
      .catch(() => router.push("/dashboard/trainings/manage"))
  }, [params.courseId, router])

  // Reset or Load Quiz State
  useEffect(() => {
    if (isModuleDialogOpen) {
      if (editingModule?.quiz && editingModule.quiz.questions.length > 0) {
        setHasQuiz(true)
        try {
          setQuizQuestions(editingModule.quiz.questions.map(q => ({
            text: q.text,
            options: JSON.parse(q.options),
            correctAnswer: q.correctAnswer
          })))
        } catch (e) {
          console.error("Error parsing questions", e)
          setQuizQuestions([])
        }
      } else {
        setHasQuiz(false)
        setQuizQuestions([])
      }
    }
  }, [isModuleDialogOpen, editingModule])

  const handleCourseUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      role: formData.get("role") === "GENERAL" ? null : formData.get("role"),
    }

    const res = await fetch(`/api/admin/trainings/${params.courseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    })

    if (res.ok) toast({ title: "Curso atualizado" })
  }

  const handleSaveModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Prepare Payload
    const data: any = {
      title: formData.get("title"),
      content: formData.get("content"),
      videoUrl: formData.get("videoUrl"),
      order: parseInt(formData.get("order") as string || "0"),
      quiz: hasQuiz ? {
        questions: quizQuestions
      } : null
    }

    let res;
    if (editingModule) {
      res = await fetch(`/api/admin/trainings/modules/${editingModule.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      })
    } else {
      res = await fetch(`/api/admin/trainings/${params.courseId}/modules`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      })
    }

    if (res.ok) {
      // Reload course to get fresh data with IDs
      const refreshRes = await fetch(`/api/admin/trainings/${params.courseId}`)
      const refreshedCourse = await refreshRes.json()
      setCourse(refreshedCourse)

      setIsModuleDialogOpen(false)
      toast({ title: "Módulo salvo" })
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Excluir este módulo?")) return
    const res = await fetch(`/api/admin/trainings/modules/${moduleId}`, { method: "DELETE" })
    if (res.ok) {
      setCourse(prev => prev ? { ...prev, modules: prev.modules.filter(m => m.id !== moduleId) } : null)
      toast({ title: "Módulo removido" })
    }
  }

  // Quiz Helpers
  const addQuestion = () => setQuizQuestions([...quizQuestions, { text: "", options: ["", ""], correctAnswer: 0 }])
  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
    const newQs = [...quizQuestions]
    newQs[idx] = { ...newQs[idx], [field]: value }
    setQuizQuestions(newQs)
  }
  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const newQs = [...quizQuestions]
    const newOpts = [...newQs[qIdx].options]
    newOpts[optIdx] = value
    newQs[qIdx].options = newOpts
    setQuizQuestions(newQs)
  }
  const removeQuestion = (idx: number) => setQuizQuestions(quizQuestions.filter((_, i) => i !== idx))


  if (loading || !course) return <div className="p-8">Carregando editor...</div>

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/trainings/manage" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Lista
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Course Details (Left) */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCourseUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input name="title" defaultValue={course.title} required />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea name="description" defaultValue={course.description || ""} className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label>Público Alvo</Label>
                  <Select name="role" defaultValue={course.role || "GENERAL"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">Geral (Todos)</SelectItem>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" /> Salvar Detalhes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Modules (Right) */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Módulos do Curso</h2>
            <Button onClick={() => { setEditingModule(null); setIsModuleDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Módulo
            </Button>
          </div>

          {course.modules.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border text-gray-500">
              Nenhum módulo criado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {course.modules.map((module) => (
                <div key={module.id} className="bg-white p-4 rounded-lg border flex items-start gap-4 shadow-sm group">
                  <div className="mt-1 text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      {module.videoUrl && <span className="flex items-center"><Video className="w-3 h-3 mr-1" /> Vídeo</span>}
                      {module.content && <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Texto</span>}
                      {module.quiz && <span className="flex items-center text-indigo-600 font-medium">+ Quiz ({module.quiz.questions.length})</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingModule(module); setIsModuleDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteModule(module.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
            <DialogDescription>Configure o conteúdo, vídeo e quiz deste módulo.</DialogDescription>
          </DialogHeader>

          <form id="moduleForm" onSubmit={handleSaveModule} className="space-y-6 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right">Título</Label>
              <Input name="title" defaultValue={editingModule?.title} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right">Ordem</Label>
              <Input name="order" type="number" defaultValue={editingModule?.order || course.modules.length + 1} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 gap-4 items-start">
              <Label className="text-right pt-2">Vídeo URL</Label>
              <div className="col-span-3 space-y-1">
                <Input name="videoUrl" defaultValue={editingModule?.videoUrl || ""} placeholder="https://youtube.com/embed/..." />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 items-start">
              <Label className="text-right pt-2">Conteúdo</Label>
              <Textarea name="content" defaultValue={editingModule?.content || ""} className="col-span-3 min-h-[100px]" placeholder="Conteúdo em texto..." />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold text-indigo-900">Quiz / Questões</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="hasQuiz" className="text-sm text-gray-600">Habilitar Quiz?</Label>
                  <input type="checkbox" id="hasQuiz" checked={hasQuiz} onChange={e => setHasQuiz(e.target.checked)} className="h-4 w-4" />
                </div>
              </div>

              {hasQuiz && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-4 rounded border relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => removeQuestion(idx)}>
                        <Trash className="w-4 h-4" />
                      </Button>

                      <div className="space-y-3 pr-8">
                        <div>
                          <Label className="text-xs text-gray-500">Pergunta {idx + 1}</Label>
                          <Input value={q.text} onChange={(e) => updateQuestion(idx, 'text', e.target.value)} placeholder="Digite a pergunta..." />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">Opções (Marque a correta)</Label>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => updateQuestion(idx, 'correctAnswer', optIdx)}
                              />
                              <Input
                                value={opt}
                                onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                className="h-8 text-sm"
                                placeholder={`Opção ${optIdx + 1}`}
                              />
                            </div>
                          ))}
                          <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => {
                            const newOpts = [...q.options, `Nova Opção`]
                            updateQuestion(idx, 'options', newOpts)
                          }}>+ Adicionar Opção</Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" className="w-full border-dashed" onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta
                  </Button>

                  {quizQuestions.length === 0 && <p className="text-center text-sm text-gray-500 py-2">Nenhuma pergunta criada.</p>}
                </div>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button type="submit" form="moduleForm">Salvar Módulo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
