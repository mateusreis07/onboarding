const { PrismaClient } = require('@prisma/client')
// Define enums locally since they might be strings in Prisma Client depending on generation status
const Role = {
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  IT: 'IT',
  FACILITIES: 'FACILITIES'
}

const Department = {
  HR: 'Human Resources',
  ENGINEERING: 'Engineering',
  OPERATIONS: 'Operations'
}

const TaskType = {
  CHECKLIST: 'CHECKLIST',
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  TRAINING: 'TRAINING',
  FORM: 'FORM'
}

const prisma = new PrismaClient()

async function main() {
  // Create HR Admin (if not exists)
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      name: 'Sarah From HR',
      password: 'password123',
      role: Role.HR,
      department: Department.HR,
      jobTitle: 'HR Manager'
    },
  })

  // Create Engineering Manager
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      name: 'Dave Dev Lead',
      password: 'password123',
      role: Role.MANAGER,
      department: Department.ENGINEERING,
      jobTitle: 'Engineering Manager'
    },
  })

  // Create IT Support User
  const itUser = await prisma.user.upsert({
    where: { email: 'it@company.com' },
    update: {},
    create: {
      email: 'it@company.com',
      name: 'Kevin IT',
      password: 'password123',
      role: Role.IT,
      department: Department.OPERATIONS,
      jobTitle: 'IT Specialist'
    },
  })

  // Create Employee (New Hire)
  const employeeUser = await prisma.user.upsert({
    where: { email: 'newhire@company.com' },
    update: {},
    create: {
      email: 'newhire@company.com',
      name: 'John Junior',
      password: 'password123',
      role: Role.EMPLOYEE,
      department: Department.ENGINEERING,
      jobTitle: 'Junior Developer',
      managerId: managerUser.id,
    },
  })

  // Create Onboarding Template: "Integração Completa (Dev)"
  // We use upsert or just create. Prone to duplicate if we don't have unique slug, but ID is CUID.
  // Let's check if it exists or create one.

  // Clean up existing templates to ensure we have the correct structure (optional, but good for dev)
  // await prisma.templateTask.deleteMany({})
  // await prisma.onboardingTemplate.deleteMany({})

  const devTemplate = await prisma.onboardingTemplate.create({
    data: {
      title: 'Integração Completa (Desenvolvedor)',
      description: 'Template completo incluindo docs, TI e treinamento.',
      department: Department.ENGINEERING,
      tasks: {
        create: [
          // 1. Docs (Auto-generates Document)
          {
            title: 'Enviar Cópia do RG/CNH',
            description: 'Necessário para cadastro no sistema de folha.',
            type: TaskType.DOCUMENT_UPLOAD,
            dueDayOffset: 2,
            assigneeRole: Role.EMPLOYEE
          },
          {
            title: 'Assinar Contrato de Trabalho',
            description: 'Leia atentamente e assine digitalmente.',
            type: TaskType.DOCUMENT_UPLOAD, // Will create a "Pending" doc
            dueDayOffset: 1,
            assigneeRole: Role.EMPLOYEE
          },
          // 2. IT Tasks (Assigned to IT Role)
          {
            title: 'Criar Conta de E-mail Corporativo',
            description: 'Gerar e-mail (nome.sobrenome@company.com) e enviar credenciais provisórias.',
            type: TaskType.CHECKLIST,
            dueDayOffset: 0,
            assigneeRole: Role.IT
          },
          {
            title: 'Configurar Notebook',
            description: 'Instalar VPN, IDEs e softwares padrão.',
            type: TaskType.CHECKLIST,
            dueDayOffset: 0,
            assigneeRole: Role.IT
          },
          // 3. Facilities
          {
            title: 'Preparar Crachá de Acesso',
            description: 'Imprimir crachá com foto enviada pelo colaborador.',
            type: TaskType.CHECKLIST,
            dueDayOffset: 0,
            assigneeRole: Role.FACILITIES
          },
          // 4. Employee Tasks
          {
            title: 'Completar Perfil no Slack',
            description: 'Adicione foto e descrição.',
            type: TaskType.CHECKLIST,
            dueDayOffset: 3,
            assigneeRole: Role.EMPLOYEE
          }
        ]
      }
    }
  })

  // ... Template creation above ...

  // Create Trainings
  console.log("Seeding Trainings...")

  // 1. Culture (General)
  const cultureCourse = await prisma.trainingCourse.create({
    data: {
      title: 'Cultura e Valores',
      description: 'Conheça a história e os princípios que guiam nossa empresa.',
      modules: {
        create: [
          {
            title: 'Nossa História',
            content: 'Fundada em 2020...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Mock
            order: 1
          },
          {
            title: 'Valores Fundamentais',
            content: '1. Inovação.\n2. Transparência.\n3. Foco no Cliente.',
            order: 2
          }
        ]
      }
    }
  })

  // 2. Security (Mandatory with Quiz)
  const securityCourse = await prisma.trainingCourse.create({
    data: {
      title: 'Segurança da Informação',
      description: 'Práticas essenciais para proteger dados.',
      modules: {
        create: [
          {
            title: 'Phishing e Engenharia Social',
            content: 'Como identificar ataques...',
            order: 1,
            quiz: {
              create: {
                questions: {
                  create: [
                    {
                      text: 'O que você deve fazer ao receber um email suspeito?',
                      options: JSON.stringify(['Clicar no link', 'Ignorar', 'Reportar ao TI']),
                      correctAnswer: 2
                    },
                    {
                      text: 'Qual a senha mais segura?',
                      options: JSON.stringify(['123456', 'password', 'XTy#92$kL']),
                      correctAnswer: 2
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    }
  })

  // 3. Technical (Engineering Role)
  const techCourse = await prisma.trainingCourse.create({
    data: {
      title: 'Arquitetura de Software',
      description: 'Padrões e práticas de desenvolvimento na empresa.',
      role: Role.EMPLOYEE, // Targeting Employees/Devs
      modules: {
        create: [
          {
            title: 'Microservices vs Monolith',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 1
          }
        ]
      }
    }
  })

  // Assign Security Course to New Hire (John Junior)
  await prisma.userTraining.create({
    data: {
      userId: employeeUser.id,
      courseId: securityCourse.id,
      status: 'IN_PROGRESS',
      progress: 0
    }
  })

  console.log({ hrUser, managerUser, itUser, templateId: devTemplate.id, courses: [cultureCourse.id, securityCourse.id, techCourse.id] })
  // 6. Legal Policies
  const policies = [
    {
      title: "Política de LGPD",
      content: "<h1>Política de Privacidade e Proteção de Dados (LGPD)</h1><p>Ao utilizar nossos sistemas, você concorda com o tratamento de seus dados pessoais para fins trabalhistas...</p>",
      mandatory: true,
      version: "1.0"
    },
    {
      title: "Código de Ética e Conduta",
      content: "<h1>Código de Ética</h1><p>Esperamos que todos os colaboradores ajam com integridade, respeito e profissionalismo...</p>",
      mandatory: true,
      version: "2024.1"
    },
    {
      title: "Termo de Confidencialidade",
      content: "<h1>Acordo de Confidencialidade</h1><p>O colaborador compromete-se a não divulgar informações sensíveis da empresa...</p>",
      mandatory: true,
      version: "1.0"
    }
  ]

  for (const policy of policies) {
    await prisma.policy.create({ data: policy })
  }

  console.log('✅ Seed complete!')
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
