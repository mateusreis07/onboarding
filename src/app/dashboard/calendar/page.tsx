"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Calendar, Clock, MapPin, Video, Bell, CheckCircle, Plus, Users, User, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  eventType: string
  startTime: string
  endTime: string
  location: string | null
  meetingUrl: string | null
  googleEventId: string | null
  outlookEventId: string | null
  reminderSent: boolean
  reminderMinutesBefore: number
  completed: boolean
}

const eventTypeColors: Record<string, string> = {
  ONBOARDING_MEETING: "bg-blue-100 text-blue-800 border-blue-200",
  ONE_ON_ONE: "bg-purple-100 text-purple-800 border-purple-200",
  TEAM_INTEGRATION: "bg-green-100 text-green-800 border-green-200",
  TRAINING_SESSION: "bg-orange-100 text-orange-800 border-orange-200",
  CUSTOM: "bg-gray-100 text-gray-800 border-gray-200"
}

const eventTypeIcons: Record<string, any> = {
  ONBOARDING_MEETING: CalendarIcon,
  ONE_ON_ONE: User,
  TEAM_INTEGRATION: Users,
  TRAINING_SESSION: GraduationCap,
  CUSTOM: CalendarIcon
}

const eventTypeLabels: Record<string, string> = {
  ONBOARDING_MEETING: "Reunião de Onboarding",
  ONE_ON_ONE: "1:1 com Gestor",
  TEAM_INTEGRATION: "Integração com Equipe",
  TRAINING_SESSION: "Treinamento",
  CUSTOM: "Personalizado"
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    console.log('🔍 Fetching calendar events...')
    fetch("/api/calendar/events")
      .then(res => {
        console.log('📡 API Response status:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('📅 Events received:', data)
        console.log('📊 Total events:', Array.isArray(data) ? data.length : 'NOT AN ARRAY')
        setEvents(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('❌ Error loading events:', err)
        setLoading(false)
      })
  }

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      eventType: formData.get("eventType"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      location: formData.get("location"),
      meetingUrl: formData.get("meetingUrl"),
      reminderMinutesBefore: parseInt(formData.get("reminderMinutesBefore") as string || "30")
    }

    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    if (res.ok) {
      toast({ title: "Evento criado com sucesso" })
      setIsDialogOpen(false)
      loadEvents()
    } else {
      toast({ title: "Erro ao criar evento", variant: "destructive" })
    }
  }

  const handleSyncGoogle = async (eventId: string) => {
    setSyncing(eventId)
    const res = await fetch(`/api/calendar/events/${eventId}/sync-google`, { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      toast({ title: "Sincronizado com Google Calendar", description: data.message })
      loadEvents()
    } else {
      toast({ title: "Erro ao sincronizar", variant: "destructive" })
    }
    setSyncing(null)
  }

  const handleSyncOutlook = async (eventId: string) => {
    setSyncing(eventId)
    const res = await fetch(`/api/calendar/events/${eventId}/sync-outlook`, { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      toast({ title: "Sincronizado com Outlook", description: data.message })
      loadEvents()
    } else {
      toast({ title: "Erro ao sincronizar", variant: "destructive" })
    }
    setSyncing(null)
  }



  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="border-l-4 border-l-gray-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const upcomingEvents = events.filter(e => new Date(e.startTime) >= new Date() && !e.completed)
  const pastEvents = events.filter(e => new Date(e.startTime) < new Date() || e.completed)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda e Calendário</h1>
          <p className="text-muted-foreground">Acompanhe suas reuniões e compromissos de onboarding.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Próximos Eventos</h2>
          <Badge variant="secondary">{upcomingEvents.length}</Badge>
        </div>

        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum evento agendado.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingEvents.map(event => {
              const Icon = eventTypeIcons[event.eventType] || CalendarIcon
              return (
                <Card key={event.id} className="border-l-4" style={{ borderLeftColor: eventTypeColors[event.eventType]?.includes('blue') ? '#3b82f6' : eventTypeColors[event.eventType]?.includes('purple') ? '#a855f7' : eventTypeColors[event.eventType]?.includes('green') ? '#22c55e' : '#f97316' }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                      </div>
                      <Badge className={eventTypeColors[event.eventType]}>
                        {eventTypeLabels[event.eventType]}
                      </Badge>
                    </div>
                    {event.description && (
                      <CardDescription className="mt-2">{event.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(event.startTime).toLocaleString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.meetingUrl && (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-blue-500" />
                        <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Link da Reunião
                        </a>
                      </div>
                    )}

                    <Separator />

                    <div className="flex gap-2">
                      {!event.googleEventId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncGoogle(event.id)}
                          disabled={syncing === event.id}
                        >
                          {syncing === event.id ? "Sincronizando..." : "Sync Google"}
                        </Button>
                      )}
                      {event.googleEventId && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Google
                        </Badge>
                      )}

                      {!event.outlookEventId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncOutlook(event.id)}
                          disabled={syncing === event.id}
                        >
                          {syncing === event.id ? "Sincronizando..." : "Sync Outlook"}
                        </Button>
                      )}
                      {event.outlookEventId && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Outlook
                        </Badge>
                      )}
                    </div>

                    {!event.reminderSent && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        <Bell className="h-3 w-3" />
                        Lembrete será enviado {event.reminderMinutesBefore || 30} minutos antes
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold text-muted-foreground">Eventos Anteriores</h2>
          <div className="space-y-2">
            {pastEvents.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.startTime).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">{eventTypeLabels[event.eventType]}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Evento</DialogTitle>
            <DialogDescription>Adicione um compromisso à sua agenda.</DialogDescription>
          </DialogHeader>

          <form id="eventForm" onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título</Label>
                <Input name="title" required placeholder="Ex: Reunião com equipe" />
              </div>

              <div className="col-span-2">
                <Label>Descrição</Label>
                <Textarea name="description" placeholder="Detalhes do evento..." />
              </div>

              <div>
                <Label>Tipo de Evento</Label>
                <Select name="eventType" defaultValue="CUSTOM">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
                    <SelectItem value="ONBOARDING_MEETING">Reunião de Onboarding</SelectItem>
                    <SelectItem value="ONE_ON_ONE">1:1 com Gestor</SelectItem>
                    <SelectItem value="TEAM_INTEGRATION">Integração com Equipe</SelectItem>
                    <SelectItem value="TRAINING_SESSION">Treinamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Lembrete (minutos antes)</Label>
                <Input name="reminderMinutesBefore" type="number" defaultValue="30" />
              </div>

              <div>
                <Label>Data/Hora Início</Label>
                <Input name="startTime" type="datetime-local" required />
              </div>

              <div>
                <Label>Data/Hora Fim</Label>
                <Input name="endTime" type="datetime-local" required />
              </div>

              <div className="col-span-2">
                <Label>Local</Label>
                <Input name="location" placeholder="Ex: Sala de Reuniões 3" />
              </div>

              <div className="col-span-2">
                <Label>Link da Reunião (opcional)</Label>
                <Input name="meetingUrl" type="url" placeholder="https://meet.google.com/..." />
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button type="submit" form="eventForm">Criar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
