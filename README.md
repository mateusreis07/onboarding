# Sistema Inteligente de Onboarding Corporativo com IA

Sistema completo de gerenciamento de onboarding de colaboradores construído com Next.js, Prisma e PostgreSQL.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação e Controle de Acesso
- Login com NextAuth.js
- Controle de acesso baseado em roles (RBAC)
- Middleware de proteção de rotas
- Suporte para múltiplos tipos de usuários (HR, Manager, Employee, IT, Finance, Facilities)

### ✅ Gestão de Templates de Onboarding (RH)
- Criar e editar templates de onboarding
- Definir tarefas específicas por cargo/departamento
- Configurar prazos e tipos de tarefas
- Visualizar todos os templates ativos

### ✅ Gestão de Colaboradores (RH)
- Cadastrar novos colaboradores
- Atribuir templates de onboarding automaticamente
- Visualizar status de onboarding de todos os colaboradores
- Acompanhar progresso individual

### ✅ Portal do Colaborador
- Visualizar progresso do onboarding
- Lista de tarefas pendentes e concluídas
- Marcar tarefas como concluídas
- Indicadores visuais de progresso
- Mensagem de congratulações ao completar 100%

### ✅ Dashboard Interativo
- Sidebar com navegação
- Diferentes visões por tipo de usuário
- Cards informativos
- Gráficos de progresso

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: NextAuth.js v5
- **Validação**: Zod
- **Formulários**: React Hook Form

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL instalado e rodando

### Passos

1. **Clone o repositório** (já feito)

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure o banco de dados**:
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/onboarding?schema=public"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Execute as migrações do Prisma**:
```bash
npx prisma migrate dev --name init
```

5. **Gere o Prisma Client**:
```bash
npx prisma generate
```

6. **Popule o banco com dados iniciais** (opcional):
```bash
npx ts-node prisma/seed.ts
```

Usuários de exemplo criados:
- **HR**: hr@company.com / password123
- **Manager**: manager@company.com / password123
- **Employee**: newhire@company.com / password123

7. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

8. **Acesse a aplicação**:
Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth handlers
│   │   ├── templates/    # CRUD de templates
│   │   ├── users/        # Gestão de usuários
│   │   └── my-onboarding/ # Tarefas do colaborador
│   ├── dashboard/        # Páginas do dashboard
│   │   ├── tasks/        # Lista de tarefas
│   │   ├── templates/    # Gestão de templates
│   │   └── employees/    # Gestão de colaboradores
│   └── login/            # Página de login
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   ├── auth/             # Componentes de autenticação
│   └── main-layout/      # Layout principal (Sidebar)
├── lib/
│   ├── prisma.ts         # Cliente Prisma
│   └── schemas/          # Schemas de validação Zod
└── auth.ts               # Configuração NextAuth

prisma/
├── schema.prisma         # Schema do banco de dados
└── seed.ts               # Script de seed
```

## 🗄️ Modelo de Dados

### Principais Entidades

- **User**: Usuários do sistema (colaboradores, gestores, RH)
- **OnboardingTemplate**: Templates de onboarding reutilizáveis
- **TemplateTask**: Tarefas definidas em um template
- **UserOnboarding**: Instância de onboarding para um usuário
- **UserTask**: Tarefas atribuídas a um usuário específico
- **Document**: Documentos enviados pelos colaboradores
- **Notification**: Notificações do sistema

## 🎯 Próximos Passos

### Funcionalidades Pendentes
- [ ] Integração com IA para geração automática de checklists
- [ ] Upload e gestão de documentos
- [ ] Sistema de notificações em tempo real
- [ ] Avaliações 30/60/90 dias
- [ ] Chatbot de IA para dúvidas
- [ ] Gamificação (pontos, badges)
- [ ] Relatórios e analytics
- [ ] Integrações (Google Workspace, Slack, Teams)

### Melhorias Técnicas
- [ ] Implementar hash de senhas (bcrypt)
- [ ] Adicionar testes unitários e E2E
- [ ] Implementar SSO
- [ ] Adicionar 2FA
- [ ] Melhorar tratamento de erros
- [ ] Adicionar logs de auditoria
- [ ] Implementar rate limiting

## 🔒 Segurança

⚠️ **IMPORTANTE**: Este é um projeto de demonstração. Para produção:
- Implemente hash de senhas com bcrypt
- Configure variáveis de ambiente seguras
- Ative HTTPS
- Implemente rate limiting
- Configure CORS adequadamente
- Adicione validação de entrada robusta

## 📝 Licença

Este projeto foi desenvolvido como demonstração de um sistema de onboarding corporativo.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Desenvolvido com ❤️ usando Next.js e Prisma**
