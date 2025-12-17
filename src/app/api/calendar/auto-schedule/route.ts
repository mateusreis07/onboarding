import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Auto-generate first week schedule for new employee
export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "HR" && session?.user?.role !== "MANAGER") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { userId, startDate } = await req.json()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { manager: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const start = new Date(startDate)
    const events = []

    // Day 1 - Monday 9:00 AM: Welcome & Onboarding Meeting
    const day1 = new Date(start)
    day1.setHours(9, 0, 0, 0)
    events.push({
      userId: userId,
      title: "Boas-vindas e Apresentação da Empresa",
      description: "Reunião inicial com RH para apresentação da cultura, valores e estrutura organizacional.",
      eventType: "ONBOARDING_MEETING",
      startTime: day1,
      endTime: new Date(day1.getTime() + 60 * 60 * 1000), // 1 hour
      location: "Sala de Reuniões - RH",
      reminderMinutesBefore: 30
    })

    // Day 1 - 11:00 AM: 1:1 with Manager
    const day1Meeting2 = new Date(start)
    day1Meeting2.setHours(11, 0, 0, 0)
    events.push({
      userId: userId,
      title: `1:1 com ${user.manager?.name || 'Gestor'}`,
      description: "Primeira conversa individual com seu gestor direto. Alinhamento de expectativas e objetivos.",
      eventType: "ONE_ON_ONE",
      startTime: day1Meeting2,
      endTime: new Date(day1Meeting2.getTime() + 45 * 60 * 1000), // 45 min
      location: "Sala do Gestor",
      reminderMinutesBefore: 15
    })

    // Day 2 - Tuesday 10:00 AM: Team Integration
    const day2 = new Date(start)
    day2.setDate(day2.getDate() + 1)
    day2.setHours(10, 0, 0, 0)
    events.push({
      userId: userId,
      title: "Integração com a Equipe",
      description: "Conheça seus colegas de time, processos internos e dinâmica de trabalho.",
      eventType: "TEAM_INTEGRATION",
      startTime: day2,
      endTime: new Date(day2.getTime() + 90 * 60 * 1000), // 1.5 hours
      location: "Sala de Reuniões - Equipe",
      reminderMinutesBefore: 30
    })

    // Day 3 - Wednesday 14:00 PM: Tools Training
    const day3 = new Date(start)
    day3.setDate(day3.getDate() + 2)
    day3.setHours(14, 0, 0, 0)
    events.push({
      userId: userId,
      title: "Treinamento de Ferramentas",
      description: "Capacitação nas principais ferramentas e sistemas utilizados pela empresa (Slack, Jira, etc).",
      eventType: "TRAINING_SESSION",
      startTime: day3,
      endTime: new Date(day3.getTime() + 120 * 60 * 1000), // 2 hours
      location: "Laboratório de TI",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      reminderMinutesBefore: 60
    })

    // Day 5 - Friday 16:00 PM: First Week Feedback
    const day5 = new Date(start)
    day5.setDate(day5.getDate() + 4)
    day5.setHours(16, 0, 0, 0)
    events.push({
      userId: userId,
      title: "Feedback da Primeira Semana",
      description: "Conversa de fechamento da primeira semana. Como foi? Dúvidas? Próximos passos.",
      eventType: "ONE_ON_ONE",
      startTime: day5,
      endTime: new Date(day5.getTime() + 30 * 60 * 1000), // 30 min
      location: "Sala do Gestor",
      reminderMinutesBefore: 30
    })

    // Create all events
    const created = await prisma.calendarEvent.createMany({
      data: events as any
    })

    return NextResponse.json({ success: true, count: created.count, events })
  } catch (error) {
    console.error("Error generating schedule:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
