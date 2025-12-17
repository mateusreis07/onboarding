const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Populando Biblioteca de Documentos...')

  const resources = [
    // MANUAIS
    {
      category: 'MANUAL',
      title: 'Manual do Colaborador 2025',
      content: 'Guia completo com todas as informações essenciais para novos colaboradores, incluindo políticas, benefícios, cultura organizacional e procedimentos internos.',
      url: 'https://example.com/manual-colaborador-2025.pdf',
      metadata: JSON.stringify({
        author: 'RH',
        version: '2025.1',
        pages: 45,
        lastUpdate: '2025-01-01'
      })
    },
    {
      category: 'MANUAL',
      title: 'Guia de Boas Práticas de Desenvolvimento',
      content: 'Padrões de código, arquitetura, Git workflow, code review e melhores práticas para desenvolvimento de software na empresa.',
      url: 'https://example.com/guia-dev-practices.pdf',
      metadata: JSON.stringify({
        author: 'Engenharia',
        version: '3.2',
        targetAudience: 'Desenvolvedores'
      })
    },
    {
      category: 'MANUAL',
      title: 'Manual de Segurança da Informação',
      content: 'Diretrizes de segurança, políticas de senha, uso de VPN, proteção de dados e procedimentos em caso de incidentes.',
      url: 'https://example.com/manual-seguranca.pdf',
      metadata: JSON.stringify({
        author: 'TI/Segurança',
        mandatory: true,
        version: '2.0'
      })
    },

    // POLÍTICAS
    {
      category: 'POLICY',
      title: 'Política de Trabalho Remoto',
      content: 'Regras e diretrizes para trabalho remoto, incluindo horários, comunicação, equipamentos e responsabilidades.',
      url: 'https://example.com/politica-remoto.pdf',
      metadata: JSON.stringify({
        effectiveDate: '2024-01-01',
        department: 'RH',
        mandatory: true
      })
    },
    {
      category: 'POLICY',
      title: 'Política de Reembolso de Despesas',
      content: 'Procedimentos para solicitação de reembolso de despesas corporativas, limites, prazos e documentação necessária.',
      url: 'https://example.com/politica-reembolso.pdf',
      metadata: JSON.stringify({
        department: 'Financeiro',
        maxAmount: 'R$ 500/mês'
      })
    },
    {
      category: 'POLICY',
      title: 'Política de Uso de Equipamentos',
      content: 'Normas para uso de notebooks, celulares e outros equipamentos corporativos, incluindo responsabilidades e cuidados.',
      url: 'https://example.com/politica-equipamentos.pdf',
      metadata: JSON.stringify({
        department: 'TI',
        mandatory: true
      })
    },

    // VÍDEOS
    {
      category: 'VIDEO',
      title: 'Bem-vindo à Empresa - Mensagem do CEO',
      content: 'Vídeo de boas-vindas do CEO apresentando a visão, missão e valores da empresa.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      metadata: JSON.stringify({
        duration: '5:30',
        speaker: 'CEO',
        year: 2025
      })
    },
    {
      category: 'VIDEO',
      title: 'Tour Virtual pelo Escritório',
      content: 'Conheça as instalações da empresa, salas de reunião, áreas de convivência e espaços de trabalho.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      metadata: JSON.stringify({
        duration: '8:15',
        location: 'Sede São Paulo'
      })
    },
    {
      category: 'VIDEO',
      title: 'Cultura e Valores da Empresa',
      content: 'Entenda os princípios que guiam nosso trabalho e como aplicá-los no dia a dia.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      metadata: JSON.stringify({
        duration: '12:00',
        department: 'RH',
        mandatory: true
      })
    },
    {
      category: 'VIDEO',
      title: 'Segurança da Informação - Treinamento Básico',
      content: 'Aprenda sobre phishing, senhas seguras, proteção de dados e boas práticas de segurança.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      metadata: JSON.stringify({
        duration: '15:45',
        department: 'TI/Segurança',
        mandatory: true,
        certification: true
      })
    },

    // FAQs
    {
      category: 'FAQ',
      title: 'Perguntas Frequentes - RH',
      content: 'Respostas para dúvidas comuns sobre férias, benefícios, ponto eletrônico, atestados médicos e muito mais.',
      url: 'https://example.com/faq-rh',
      metadata: JSON.stringify({
        department: 'RH',
        questions: 25,
        lastUpdate: '2025-01-15'
      })
    },
    {
      category: 'FAQ',
      title: 'FAQ - Suporte de TI',
      content: 'Como resolver problemas comuns de VPN, e-mail, acesso a sistemas, instalação de software e muito mais.',
      url: 'https://example.com/faq-ti',
      metadata: JSON.stringify({
        department: 'TI',
        questions: 30
      })
    },
    {
      category: 'FAQ',
      title: 'Dúvidas sobre Onboarding',
      content: 'Tudo que você precisa saber sobre seu processo de integração: cronograma, tarefas, contatos e próximos passos.',
      url: 'https://example.com/faq-onboarding',
      metadata: JSON.stringify({
        department: 'RH',
        targetAudience: 'Novos Colaboradores',
        questions: 15
      })
    }
  ]

  for (const resource of resources) {
    await prisma.libraryResource.create({
      data: resource
    })
    console.log(`✅ Documento criado: ${resource.title} (${resource.category})`)
  }

  console.log('\n✅ Biblioteca de Documentos populada com sucesso!')
  console.log(`📚 Total: ${resources.length} recursos adicionados`)
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
