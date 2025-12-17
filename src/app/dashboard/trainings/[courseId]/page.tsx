"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlayCircle, FileText, CheckCircle, Lock, Award, ArrowRight, ArrowLeft } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface Question {
  id: string
  text: string
  options: string // serialized JSON
  correctAnswer?: number
}

interface Module {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  quiz?: {
    questions: Question[]
  }
}

interface Course {
  id: string
  title: string
  description: string
  modules: Module[]
  userProgress: { status: string, progress: number, certificateUrl: string | null }[]
}

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizResult, setQuizResult] = useState<"pass" | "fail" | null>(null)
  const [completedModules, setCompletedModules] = useState<number[]>([]) // Indices of completed modules

  useEffect(() => {
    // Enroll and Fetch
    const init = async () => {
      // Enroll first
      await fetch(`/api/trainings/${params.courseId}/enroll`, { method: "POST" })

      // Fetch Details
      const res = await fetch(`/api/trainings/${params.courseId}`)
      if (!res.ok) {
        router.push("/dashboard/trainings")
        return
      }
      const data = await res.json()
      setCourse(data)

      // Restore progress logic could go here based on backend data,
      // but for now we start at 0 or max unlocked.
      const progress = data.userProgress[0]
      if (progress?.status === 'COMPLETED') {
        setCompletedModules(data.modules.map((_: any, i: number) => i))
        setActiveModuleIndex(0)
      }

      setLoading(false)
    }
    init()
  }, [params.courseId, router])

  const handleNext = async () => {
    if (!course) return

    // Mark current as completed locally
    if (!completedModules.includes(activeModuleIndex)) {
      setCompletedModules(prev => [...prev, activeModuleIndex])
    }

    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1)
      setQuizResult(null)
      setQuizAnswers({})
    } else {
      // Finish Course
      await handleFinish()
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    const res = await fetch(`/api/trainings/${params.courseId}/complete`, { method: "POST" })
    if (res.ok) {
      const updated = await res.json()
      // Update local state to show certificate
      if (course) {
        setCourse({ ...course, userProgress: [updated] })
      }
      toast({ title: "Parabéns!", description: "Curso concluído com sucesso." })
    }
    setLoading(false)
  }

  const handleQuizSubmit = () => {
    if (!course) return
    const module = course.modules[activeModuleIndex]
    if (!module.quiz) return handleNext()

    // Validate
    let correctCount = 0
    const questions = module.quiz.questions

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const answer = quizAnswers[q.id]
      if (answer !== undefined && answer === q.correctAnswer) {
        correctCount++
      }
    }

    // Simple Pass Logic: Must get all right (or > 70%)
    if (correctCount === questions.length) {
      setQuizResult("pass")
      toast({ title: "Aprovado!", description: "Você acertou todas as questões.", className: "bg-green-100 border-green-200" })
    } else {
      setQuizResult("fail")
      toast({ title: "Tente Novamente", description: "Você não atingiu a pontuação necessária.", variant: "destructive" })
    }
  }

  if (loading || !course) return <div className="h-screen flex items-center justify-center">Carregando conteúdo...</div>

  const activeModule = course.modules[activeModuleIndex]
  const isCompleted = course.userProgress[0]?.status === 'COMPLETED'

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-200 flex flex-col bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/trainings")} className="mb-2 -ml-2 text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <h2 className="font-bold text-gray-900 leading-tight">{course.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            {isCompleted && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Curso Concluído</span>}
          </div>
        </div>
        <div className="flex-1 py-2">
          {course.modules.map((m, idx) => {
            const isActive = idx === activeModuleIndex
            const isDone = completedModules.includes(idx) || isCompleted
            const isLocked = !isDone && idx > 0 && !completedModules.includes(idx - 1) && !isActive

            return (
              <button
                key={m.id}
                disabled={isLocked}
                onClick={() => setActiveModuleIndex(idx)}
                className={`w-full text-left p-3 px-4 flex items-start gap-3 transition-colors ${isActive ? "bg-white border-l-4 border-indigo-600 shadow-sm" :
                    isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
              >
                <div className="mt-0.5">
                  {isDone ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                    isLocked ? <Lock className="w-4 h-4 text-gray-400" /> :
                      m.videoUrl ? <PlayCircle className="w-4 h-4 text-gray-600" /> :
                        <FileText className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive ? "text-indigo-700" : "text-gray-700"}`}>{m.title}</p>
                  <span className="text-xs text-gray-400">{m.quiz ? "Quiz Prático" : "Leitura/Vídeo"}</span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white p-8 md:p-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeModule.title}</h1>
            <Separator />
          </div>

          {/* Video Content */}
          {activeModule.videoUrl && (
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg mb-8">
              <iframe
                src={activeModule.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title="Video Player"
              />
            </div>
          )}

          {/* Text Content */}
          {activeModule.content && (
            <div className="prose prose-slate max-w-none text-gray-700 whitespace-pre-wrap">
              {activeModule.content}
            </div>
          )}

          {/* Quiz Section */}
          {activeModule.quiz && (
            <Card className="mt-8 border-indigo-100 bg-indigo-50/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" /> Teste de Conhecimento
                </h3>

                <div className="space-y-6">
                  {activeModule.quiz.questions.map((q, idx) => {
                    const options = JSON.parse(q.options) as string[]
                    return (
                      <div key={q.id}>
                        <p className="font-medium text-gray-900 mb-3">{idx + 1}. {q.text}</p>
                        <RadioGroup
                          onValueChange={(val) => setQuizAnswers(prev => ({ ...prev, [q.id]: parseInt(val) }))}
                          value={quizAnswers[q.id]?.toString()}
                          disabled={quizResult === 'pass'}
                        >
                          {options.map((opt, optIdx) => (
                            <div className="flex items-center space-x-2" key={optIdx}>
                              <RadioGroupItem value={optIdx.toString()} id={`${q.id}-${optIdx}`} />
                              <Label htmlFor={`${q.id}-${optIdx}`}>{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )
                  })}
                </div>

                {quizResult === 'fail' && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>Você precisa acertar todas as questões para avançar.</AlertDescription>
                  </Alert>
                )}

                {quizResult === 'pass' && (
                  <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Parabéns!</AlertTitle>
                    <AlertDescription>Você concluiu este módulo com sucesso.</AlertDescription>
                  </Alert>
                )}

                {/* Submit Quiz actions */}
                <div className="mt-6">
                  {quizResult !== 'pass' ? (
                    <Button onClick={handleQuizSubmit}>Enviar Respostas</Button>
                  ) : (
                    <Button onClick={handleNext} className="gap-2">
                      Avançar para Próximo Módulo <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Button (If no quiz) */}
          {!activeModule.quiz && (
            <div className="flex justify-end mt-8">
              <Button onClick={handleNext} size="lg" className="gap-2">
                {activeModuleIndex === course.modules.length - 1 ? "Concluir Curso" : "Próxima Aula"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Certificate */}
          {isCompleted && (
            <div className="mt-12 p-8 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 text-center">
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-yellow-800">Parabéns!</h2>
              <p className="text-yellow-700 mt-2">Você completou o curso <strong>{course.title}</strong>.</p>
              <Button className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-lg">
                Baixar Certificado
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
