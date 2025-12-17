import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding calendar events...')

  // Find the employee user (John Junior)
  const employee = await prisma.user.findUnique({
    where: { email: 'newhire@company.com' }
  })

  if (!employee) {
    console.log('Employee user not found. Run main seed first.')
    return
  }

  // Create sample events for the first week
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const day2 = new Date(today)
  day2.setDate(day2.getDate() + 2)

  const day3 = new Date(today)
  day3.setDate(day3.getDate() + 3)

  const day5 = new Date(today)
  day5.setDate(day5.getDate() + 5)

  const events = [
    {
      userId: employee.id,
      title: "Boas-vindas e Apresentação da Empresa",
      description: "Reunião inicial com RH para apresentação da cultura, valores e estrutura organizacional.",
      eventType: "ONBOARDING_MEETING",
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      location: "Sala de Reuniões - RH",
      reminderMinutesBefore: 30
    },
    {
      userId: employee.id,
      title: "1:1 com Gestor",
      description: "Primeira conversa individual com seu gestor direto. Alinhamento de expectativas e objetivos.",
      eventType: "ONE_ON_ONE",
      startTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(11, 45, 0, 0)),
      location: "Sala do Gestor",
      reminderMinutesBefore: 15
    },
    {
      userId: employee.id,
      title: "Integração com a Equipe",
      description: "Conheça seus colegas de time, processos internos e dinâmica de trabalho.",
      eventType: "TEAM_INTEGRATION",
      startTime: new Date(day2.setHours(10, 0, 0, 0)),
      endTime: new Date(day2.setHours(11, 30, 0, 0)),
      location: "Sala de Reuniões - Equipe",
      reminderMinutesBefore: 30
    },
    {
      userId: employee.id,
      title: "Treinamento de Ferramentas",
      description: "Capacitação nas principais ferramentas e sistemas utilizados pela empresa (Slack, Jira, etc).",
      eventType: "TRAINING_SESSION",
      startTime: new Date(day3.setHours(14, 0, 0, 0)),
      endTime: new Date(day3.setHours(16, 0, 0, 0)),
      location: "Laboratório de TI",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      reminderMinutesBefore: 60
    },
    {
      userId: employee.id,
      title: "Feedback da Primeira Semana",
      description: "Conversa de fechamento da primeira semana. Como foi? Dúvidas? Próximos passos.",
      eventType: "ONE_ON_ONE",
      startTime: new Date(day5.setHours(16, 0, 0, 0)),
      endTime: new Date(day5.setHours(16, 30, 0, 0)),
      location: "Sala do Gestor",
      reminderMinutesBefore: 30
    }
  ]

  for (const event of events) {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        userId: event.userId,
        title: event.title
      }
    })

    if (!existing) {
      await prisma.calendarEvent.create({ data: event as any })
      console.log(`Created: ${event.title}`)
    } else {
      console.log(`Skipped (Exists): ${event.title}`)
    }
  }

  console.log('✅ Calendar events seeding complete.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
