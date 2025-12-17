const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Populando Funções, Departamentos e Cargos...')

  // 1. FUNÇÕES (ROLES)
  const roles = [
    { code: 'HR', label: 'Recursos Humanos', description: 'Responsável pela gestão de pessoas e processos de RH', isSystem: true },
    { code: 'MANAGER', label: 'Gestor', description: 'Gerencia equipes e colaboradores', isSystem: true },
    { code: 'EMPLOYEE', label: 'Colaborador', description: 'Funcionário padrão da empresa', isSystem: true },
    { code: 'IT', label: 'TI', description: 'Suporte técnico e infraestrutura', isSystem: false },
    { code: 'FACILITIES', label: 'Facilities', description: 'Gestão de instalações e infraestrutura física', isSystem: false },
  ]

  for (const role of roles) {
    await prisma.systemRole.upsert({
      where: { code: role.code },
      update: {},
      create: role
    })
    console.log(`✅ Função criada: ${role.label}`)
  }

  // 2. DEPARTAMENTOS
  const departments = [
    { code: 'ENGINEERING', label: 'Engenharia', description: 'Desenvolvimento de software e tecnologia', isSystem: true },
    { code: 'HR', label: 'Recursos Humanos', description: 'Gestão de pessoas e talentos', isSystem: true },
    { code: 'OPERATIONS', label: 'Operações', description: 'Gestão operacional e infraestrutura', isSystem: true },
    { code: 'SALES', label: 'Vendas', description: 'Comercial e relacionamento com clientes', isSystem: false },
    { code: 'MARKETING', label: 'Marketing', description: 'Marketing e comunicação', isSystem: false },
    { code: 'FINANCE', label: 'Financeiro', description: 'Gestão financeira e contábil', isSystem: false },
    { code: 'PRODUCT', label: 'Produto', description: 'Gestão de produtos', isSystem: false },
  ]

  for (const dept of departments) {
    await prisma.systemDepartment.upsert({
      where: { code: dept.code },
      update: {},
      create: dept
    })
    console.log(`✅ Departamento criado: ${dept.label}`)
  }

  // 3. CARGOS (JOB TITLES)
  const jobTitles = [
    // Engenharia
    { code: 'DESENVOLVEDOR_JUNIOR', label: 'Desenvolvedor Júnior', category: 'Engenharia', isSystem: true },
    { code: 'DESENVOLVEDOR_PLENO', label: 'Desenvolvedor Pleno', category: 'Engenharia', isSystem: false },
    { code: 'DESENVOLVEDOR_SENIOR', label: 'Desenvolvedor Sênior', category: 'Engenharia', isSystem: false },
    { code: 'TECH_LEAD', label: 'Tech Lead', category: 'Engenharia', isSystem: false },
    { code: 'ENGENHEIRO_SOFTWARE', label: 'Engenheiro de Software', category: 'Engenharia', isSystem: false },

    // RH
    { code: 'ANALISTA_RH', label: 'Analista de RH', category: 'Recursos Humanos', isSystem: false },
    { code: 'GERENTE_RH', label: 'Gerente de RH', category: 'Recursos Humanos', isSystem: true },
    { code: 'COORDENADOR_RH', label: 'Coordenador de RH', category: 'Recursos Humanos', isSystem: false },

    // Operações/TI
    { code: 'ANALISTA_TI', label: 'Analista de TI', category: 'Operações', isSystem: false },
    { code: 'ESPECIALISTA_TI', label: 'Especialista de TI', category: 'Operações', isSystem: true },
    { code: 'GERENTE_OPERACOES', label: 'Gerente de Operações', category: 'Operações', isSystem: false },

    // Vendas
    { code: 'EXECUTIVO_VENDAS', label: 'Executivo de Vendas', category: 'Vendas', isSystem: false },
    { code: 'GERENTE_VENDAS', label: 'Gerente de Vendas', category: 'Vendas', isSystem: false },

    // Marketing
    { code: 'ANALISTA_MARKETING', label: 'Analista de Marketing', category: 'Marketing', isSystem: false },
    { code: 'COORDENADOR_MARKETING', label: 'Coordenador de Marketing', category: 'Marketing', isSystem: false },

    // Financeiro
    { code: 'ANALISTA_FINANCEIRO', label: 'Analista Financeiro', category: 'Financeiro', isSystem: false },
    { code: 'CONTROLLER', label: 'Controller', category: 'Financeiro', isSystem: false },

    // Produto
    { code: 'PRODUCT_MANAGER', label: 'Product Manager', category: 'Produto', isSystem: false },
    { code: 'PRODUCT_OWNER', label: 'Product Owner', category: 'Produto', isSystem: false },

    // Gestão
    { code: 'GERENTE_ENGENHARIA', label: 'Gerente de Engenharia', category: 'Engenharia', isSystem: true },
    { code: 'DIRETOR', label: 'Diretor', category: 'Gestão', isSystem: false },
  ]

  for (const job of jobTitles) {
    await prisma.systemJobTitle.upsert({
      where: { code: job.code },
      update: {},
      create: job
    })
    console.log(`✅ Cargo criado: ${job.label}`)
  }

  console.log('\n✅ Seed de Funções, Departamentos e Cargos concluído!')
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
