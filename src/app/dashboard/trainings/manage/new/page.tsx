"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      role: formData.get("role") === "GENERAL" ? null : formData.get("role"),
      coverImage: formData.get("coverImage")
    }

    const res = await fetch("/api/admin/trainings", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    })

    if (res.ok) {
      toast({ title: "Sucesso", description: "Curso criado." })
      router.push("/dashboard/trainings/manage")
    } else {
      toast({ title: "Erro", description: "Falha ao criar curso.", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link href="/dashboard/trainings/manage" className="flex items-center text-sm text-gray-500 mb-6 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Novo Curso / Trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Curso</Label>
              <Input id="title" name="title" required placeholder="Ex: Introdução à Segurança" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" placeholder="Uma breve descrição do que será ensinado." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Público Alvo (Role)</Label>
              <Select name="role">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">Geral (Todos)</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee (Padrão)</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/*
                          <div className="space-y-2">
                             <Label htmlFor="coverImage">URL da Capa (Opcional)</Label>
                             <Input id="coverImage" name="coverImage" placeholder="https://..." />
                        </div>
                        */}

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Criar Curso"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
