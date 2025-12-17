import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding policies...')

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

  for (const p of policies) {
    // Check if exists by title to avoid duplicates
    const existing = await prisma.policy.findFirst({ where: { title: p.title } })
    if (!existing) {
      await prisma.policy.create({ data: p })
      console.log(`Created: ${p.title}`)
    } else {
      console.log(`Skipped (Exists): ${p.title}`)
    }
  }

  console.log('✅ Policies seeding complete.')
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
