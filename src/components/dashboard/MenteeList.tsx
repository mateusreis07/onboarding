"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle } from "lucide-react"

interface Mentee {
  id: string
  name: string | null
  email: string
  onboarding: {
    status: string
    progress: number
    tasks: {
      id: string
      title: string
      status: string
    }[]
  } | null
}

interface MenteeListProps {
  mentees: Mentee[]
}

export function MenteeList({ mentees }: MenteeListProps) {
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  if (mentees.length === 0) return null

  const handleMenteeClick = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    setIsOpen(true)
  }

  const calculateProgress = (tasks: { status: string }[] | undefined) => {
    if (!tasks || tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'COMPLETED').length
    return Math.round((completed / tasks.length) * 100)
  }

  const selectedProgress = selectedMentee?.onboarding?.tasks
    ? calculateProgress(selectedMentee.onboarding.tasks)
    : 0

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">🤝</span> Meus Afilhados
          </CardTitle>
          <CardDescription>Clique para ver detalhes do andamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mentees.map(mentee => {
            const progress = mentee.onboarding?.tasks
              ? calculateProgress(mentee.onboarding.tasks)
              : 0

            return (
              <div
                key={mentee.id}
                className="p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handleMenteeClick(mentee)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-blue-900">{mentee.name}</p>
                    <p className="text-xs text-blue-600">{mentee.email}</p>
                  </div>
                  <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-500 mt-2 text-right">
                  {mentee.onboarding?.status === 'COMPLETED' ? 'Concluído' : 'Em andamento'}
                </p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Acompanhamento de {selectedMentee?.name}</DialogTitle>
            <DialogDescription>
              Detalhes do progresso e tarefas do onboarding.
            </DialogDescription>
          </DialogHeader>

          {selectedMentee?.onboarding ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progresso Geral</span>
                  <span>{selectedProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${selectedProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Tarefas</h4>

                {selectedMentee.onboarding.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa atribuída.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedMentee.onboarding.tasks.map(task => {
                      const isCompleted = task.status === 'COMPLETED'
                      return (
                        <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>{task.title}</p>
                            <Badge variant={isCompleted ? "outline" : "secondary"} className="mt-1 text-[10px]">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Este colaborador não iniciou o onboarding ainda.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
