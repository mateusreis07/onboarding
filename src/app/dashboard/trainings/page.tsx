"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, CheckCircle2, Award, BookOpen } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface TrainingCourse {
  id: string
  title: string
  description: string
  role: string | null
  _count: { modules: number }
  userProgress: { status: string, progress: number, certificateUrl: string | null }[]
}

export default function TrainingsPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trainings")
      .then(res => res.json())
      .then(data => {
        setCourses(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])



  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </header>

        <section>
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="flex flex-col">
                <div className="h-32 bg-slate-100 relative" />
                <CardContent className="flex-1 flex flex-col pt-4 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-10 w-full mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div className="h-32 bg-indigo-50" />
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    )
  }

  const myTrainings = courses.filter(c => c.userProgress.length > 0)
  const availableTrainings = courses.filter(c => c.userProgress.length === 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Centro de Capacitação</h1>
        <p className="mt-2 text-gray-600">Desenvolva suas habilidades com nossos cursos e trilhas de aprendizado.</p>
      </header>

      {/* My Learning Path / Active */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Meu Aprendizado
        </h2>
        {myTrainings.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            Você ainda não iniciou nenhum treinamento. Explore as opções abaixo!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTrainings.map(course => {
              const progress = course.userProgress[0]
              const isCompleted = progress.status === 'COMPLETED'

              return (
                <Card key={course.id} className="flex flex-col">
                  <div className="h-32 bg-slate-800 relative">
                    {/* Placeholder Cover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg leading-tight">{course.title}</h3>
                    </div>
                  </div>
                  <CardContent className="flex-1 flex flex-col pt-4 gap-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

                    <div className="mt-auto space-y-2">
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>{isCompleted ? 'Concluído' : 'Em andamento'}</span>
                        <span>{progress.progress}%</span>
                      </div>
                      <Progress value={progress.progress} className="h-2" />

                      <div className="pt-2">
                        <Button asChild className="w-full" variant={isCompleted ? "outline" : "default"}>
                          <Link href={`/dashboard/trainings/${course.id}`}>
                            {isCompleted ? "Revisar Conteúdo" : "Continuar"}
                          </Link>
                        </Button>
                        {isCompleted && progress.certificateUrl && (
                          <Button variant="ghost" className="w-full mt-2 text-green-600 gap-2 hover:text-green-700 hover:bg-green-50">
                            <Award className="w-4 h-4" /> Ver Certificado
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Explore / Recommended */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-600" />
            Disponíveis para Você
          </h2>
          <span className="text-sm text-gray-500">Baseado no seu cargo</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTrainings.map(course => (
            <Card key={course.id} className="group hover:shadow-lg transition-all">
              <div className="h-32 bg-indigo-900/10 relative flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-indigo-300 opacity-50" />
                {course.role && (
                  <Badge className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                    Recomendado
                  </Badge>
                )}
              </div>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{course._count.modules} Módulos</span>
                  {/* <span>30 min</span> Mock duration */}
                </div>
                <Button asChild className="w-full mt-4" variant="secondary">
                  <Link href={`/dashboard/trainings/${course.id}`}>
                    Iniciar Curso
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {availableTrainings.length === 0 && (
            <p className="text-gray-500 col-span-full">Não há novos treinamentos disponíveis no momento.</p>
          )}
        </div>
      </section>
    </div>
  )
}
