"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Edit, Trash2, Users, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TrainingCourse {
  id: string
  title: string
  role: string | null
  createdAt: string
  _count: { modules: number, userProgress: number }
}

export default function TrainingManagementPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/trainings")
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

  // Simple delete handler (in real app would use toast and refresh)
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este treinamento?")) return
    await fetch(`/api/admin/trainings/${id}`, { method: 'DELETE' })
    setCourses(courses.filter(c => c.id !== id))
  }

  if (loading) return <div className="p-8">Carregando gestão...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Treinamentos</h1>
          <p className="text-muted-foreground">Crie, edite e gerencie as trilhas de aprendizado da empresa.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/trainings/manage/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Curso
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <Card key={course.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {course.role ? (
                  <Badge variant="outline">{course.role}</Badge>
                ) : (
                  <Badge variant="secondary">Geral</Badge>
                )}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold py-2">{course.title}</div>
              <div className="text-xs text-muted-foreground mb-4">
                {course._count.modules} módulos • {course._count.userProgress} alunos iniciaram
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/trainings/manage/${course.id}`}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Link>
                </Button>
                <Button variant="destructive" size="icon" className="shrink-0" onClick={() => handleDelete(course.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
