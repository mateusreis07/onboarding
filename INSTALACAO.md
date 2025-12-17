# Sistema Inteligente de Onboarding - Guia de Instalação Rápida

## ⚠️ IMPORTANTE: Configuração do Banco de Dados

O sistema está quase pronto! Falta apenas configurar o banco de dados PostgreSQL.

### Opção 1: Usar PostgreSQL Local

1. **Instale o PostgreSQL** (se ainda não tiver):
   - Download: https://www.postgresql.org/download/windows/
   - Ou use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Crie o arquivo `.env`** na raiz do projeto com:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/onboarding?schema=public"
NEXTAUTH_SECRET="sua-chave-secreta-aqui-mude-em-producao"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Execute as migrações**:
```bash
npx prisma migrate dev --name init
```

4. **Popule o banco com dados de teste**:
```bash
npx ts-node prisma/seed.ts
```

### Opção 2: Usar Prisma Postgres (Cloud - Grátis)

1. **Crie um banco gratuito**:
```bash
npx create-db
```

2. **Copie a DATABASE_URL** gerada e cole no arquivo `.env`

3. **Execute as migrações**:
```bash
npx prisma migrate dev --name init
```

## 🚀 Depois de Configurar o Banco

1. **Inicie o servidor**:
```bash
npm run dev
```

2. **Acesse**: http://localhost:3000

3. **Faça login com**:
   - **HR**: hr@company.com / password123
   - **Manager**: manager@company.com / password123
   - **Employee**: newhire@company.com / password123

## 📋 O que já está implementado

✅ Sistema de autenticação completo
✅ Dashboard com sidebar de navegação
✅ Gestão de Templates de Onboarding (RH)
✅ Gestão de Colaboradores (RH)
✅ Portal do Colaborador com tarefas
✅ Controle de progresso automático
✅ Interface moderna com shadcn/ui

## 🔧 Troubleshooting

### Erro "Can't reach database server"
- Verifique se o PostgreSQL está rodando
- Confirme que a porta 5432 está disponível
- Verifique as credenciais no arquivo `.env`

### Erro "Module not found: '.prisma/client'"
- Execute: `npx prisma generate`
- Reinicie o servidor: `npm run dev`

### Porta 3000 em uso
- O sistema usará automaticamente a porta 3001
- Ou pare o processo: `Get-Process -Id <PID> | Stop-Process -Force`

## 📞 Próximos Passos

Após configurar o banco de dados, você poderá:
- Criar templates de onboarding personalizados
- Adicionar novos colaboradores
- Atribuir planos de onboarding
- Acompanhar o progresso em tempo real
- Gerenciar tarefas e documentos

---

**Nota**: Este é um projeto de demonstração. Para produção, implemente:
- Hash de senhas com bcrypt
- Variáveis de ambiente seguras
- HTTPS
- Rate limiting
- Validação robusta de entrada
