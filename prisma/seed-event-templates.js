const { PrismaClient } = require('@prisma/client')

const Role = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  HR: "HR"
}

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding event templates...')

  const templates = [
    {
      title: "Boas-vindas e Apresentação da Empresa",
      description: "Reunião inicial com RH para apresentação da cultura, valores e estrutura organizacional.",
      eventType: "ONBOARDING_MEETING",
      dayOffset: 0,  // First day
      startHour: 9,
      startMinute: 0,
      durationMinutes: 60,
      location: "Sala de Reuniões - RH",
      role: null,  // All roles
      mandatory: true
    },
    {
      title: "1:1 com Gestor",
      description: "Primeira conversa individual com seu gestor direto. Alinhamento de expectativas e objetivos.",
      eventType: "ONE_ON_ONE",
      dayOffset: 0,  // First day
      startHour: 11,
      startMinute: 0,
      durationMinutes: 45,
      location: "Sala do Gestor",
      role: null,  // All roles
      mandatory: true
    },
    {
      title: "Integração com a Equipe",
      description: "Conheça seus colegas de time, processos internos e dinâmica de trabalho.",
      eventType: "TEAM_INTEGRATION",
      dayOffset: 1,  // Second day
      startHour: 10,
      startMinute: 0,
      durationMinutes: 90,
      location: "Sala de Reuniões - Equipe",
      role: null,  // All roles
      mandatory: true
    },
    {
      title: "Treinamento de Ferramentas",
      description: "Capacitação nas principais ferramentas e sistemas utilizados pela empresa (Slack, Jira, etc).",
      eventType: "TRAINING_SESSION",
      dayOffset: 2,  // Third day
      startHour: 14,
      startMinute: 0,
      durationMinutes: 120,
      location: "Laboratório de TI",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      role: null,  // All roles
      mandatory: true
    },
    {
      title: "Feedback da Primeira Semana",
      description: "Conversa de fechamento da primeira semana. Como foi? Dúvidas? Próximos passos.",
      eventType: "ONE_ON_ONE",
      dayOffset: 4,  // Fifth day (Friday)
      startHour: 16,
      startMinute: 0,
      durationMinutes: 30,
      location: "Sala do Gestor",
      role: null,  // All roles
      mandatory: true
    },
    // Role-specific templates
    {
      title: "Treinamento Técnico - Arquitetura",
      description: "Apresentação da arquitetura de software e stack tecnológico da empresa.",
      eventType: "TRAINING_SESSION",
      dayOffset: 3,  // Fourth day
      startHour: 10,
      startMinute: 0,
      durationMinutes: 120,
      location: "Sala de Desenvolvimento",
      role: Role.EMPLOYEE,  // Only for developers
      mandatory: false
    },
    {
      title: "Reunião de Alinhamento - Gestão",
      description: "Alinhamento estratégico e apresentação de KPIs e metas da área.",
      eventType: "ONBOARDING_MEETING",
      dayOffset: 1,  // Second day
      startHour: 15,
      startMinute: 0,
      durationMinutes: 60,
      location: "Sala de Diretoria",
      role: Role.MANAGER,  // Only for managers
      mandatory: true
    }
  ]

  for (const t of templates) {
    const existing = await prisma.eventTemplate.findFirst({
      where: { title: t.title }
    })

    if (!existing) {
      await prisma.eventTemplate.create({ data: t as any })
      console.log(`✅ Created: ${t.title}`)
    } else {
      console.log(`⏭️  Skipped (Exists): ${t.title}`)
    }
  }

  console.log('\n✅ Event templates seeding complete.')
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
