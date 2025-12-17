# Sistema de Gestão de Agenda - Documentação

## 📋 Visão Geral

O sistema de agenda possui **dois níveis**:

### 1. **Templates de Eventos** (Gerenciamento pelo RH)
- **Localização**: `/dashboard/calendar/templates` (apenas RH)
- **Função**: Criar modelos/receitas de eventos que serão aplicados aos colaboradores
- **Exemplo**: "1:1 com Gestor - Dia 0 às 11:00 - 45min"

### 2. **Eventos do Calendário** (Agenda do Usuário)
- **Localização**: `/dashboard/calendar` (todos os usuários)
- **Função**: Ver os compromissos reais agendados
- **Exemplo**: "1:1 com Gestor - 13/12/2024 às 11:00"

---

## 🔄 Fluxo de Trabalho

### Passo 1: RH Cria Templates
1. RH acessa `/dashboard/calendar/templates`
2. Cria templates de eventos padrão:
   - **Boas-vindas** (Dia 0, 9h, 60min) → Todos
   - **1:1 com Gestor** (Dia 0, 11h, 45min) → Todos
   - **Integração com Equipe** (Dia 1, 10h, 90min) → Todos
   - **Treinamento Técnico** (Dia 3, 10h, 120min) → Apenas EMPLOYEE
   - **Reunião de Gestão** (Dia 1, 15h, 60min) → Apenas MANAGER

### Passo 2: Aplicar Templates ao Colaborador
**Quando um novo colaborador entra:**

#### Opção A: Via API (Recomendado)
```javascript
// Na página de gestão de colaboradores
POST /api/admin/event-templates/apply
{
  "userId": "abc123",
  "startDate": "2024-12-13"  // Data de início do colaborador
}
```

#### Opção B: Automaticamente
- Quando o RH cria um novo colaborador
- O sistema pode aplicar os templates automaticamente baseado no cargo

### Passo 3: Colaborador Vê sua Agenda
1. Colaborador acessa `/dashboard/calendar`
2. Vê os eventos criados a partir dos templates
3. Pode criar eventos personalizados adicionais

---

## 🎯 Funcionalidades por Perfil

### 👤 Colaborador (EMPLOYEE)
- ✅ Ver sua própria agenda
- ✅ Criar eventos personalizados
- ✅ Sincronizar com Google/Outlook
- ❌ Não vê templates
- ❌ Não pode aplicar templates

### 👔 RH (HR)
- ✅ Tudo que o colaborador pode
- ✅ **Gerenciar templates** (`/dashboard/calendar/templates`)
- ✅ **Aplicar templates** a qualquer colaborador
- ✅ Ver agenda de todos

---

## 📊 Estrutura de Dados

### EventTemplate (Template)
```typescript
{
  id: string
  title: "1:1 com Gestor"
  eventType: "ONE_ON_ONE"
  dayOffset: 0           // Dia relativo ao início
  startHour: 11          // Hora do dia
  startMinute: 0
  durationMinutes: 45
  role: null             // null = todos, "EMPLOYEE" = só devs
  mandatory: true
}
```

### CalendarEvent (Evento Real)
```typescript
{
  id: string
  userId: "abc123"       // Dono do evento
  title: "1:1 com Gestor"
  startTime: "2024-12-13T11:00:00Z"  // Data/hora absoluta
  endTime: "2024-12-13T11:45:00Z"
  eventType: "ONE_ON_ONE"
  location: "Sala do Gestor"
}
```

---

## 🔧 APIs Disponíveis

### Templates (Admin apenas)
- `GET /api/admin/event-templates` - Listar templates
- `POST /api/admin/event-templates` - Criar template
- `PUT /api/admin/event-templates/[id]` - Editar template
- `DELETE /api/admin/event-templates/[id]` - Deletar template
- `POST /api/admin/event-templates/apply` - **Aplicar templates a um usuário**

### Eventos (Usuário)
- `GET /api/calendar/events` - Listar meus eventos
- `POST /api/calendar/events` - Criar evento personalizado
- `POST /api/calendar/events/[id]/sync-google` - Sincronizar com Google
- `POST /api/calendar/events/[id]/sync-outlook` - Sincronizar com Outlook

---

## 💡 Exemplo Prático

### Cenário: Novo Desenvolvedor Entra

1. **RH cria o colaborador** João Silva
   - Cargo: EMPLOYEE
   - Data de início: 13/12/2024

2. **Sistema aplica templates**
   ```javascript
   // Automático ou via botão
   POST /api/admin/event-templates/apply
   {
     "userId": "joao-silva-id",
     "startDate": "2024-12-13"
   }
   ```

3. **Eventos criados na agenda do João:**
   - 13/12 09:00 - Boas-vindas (template geral)
   - 13/12 11:00 - 1:1 com Gestor (template geral)
   - 14/12 10:00 - Integração com Equipe (template geral)
   - 15/12 14:00 - Treinamento de Ferramentas (template geral)
   - 16/12 10:00 - **Treinamento Técnico** (template específico EMPLOYEE)
   - 17/12 16:00 - Feedback da Semana (template geral)

4. **João acessa `/dashboard/calendar`**
   - Vê todos os 6 eventos
   - Pode sincronizar com Google Calendar
   - Pode criar eventos adicionais

---

## ✅ Próximos Passos Sugeridos

1. **Integrar aplicação de templates** na criação de colaboradores
2. **Adicionar botão** na página de detalhes do colaborador para aplicar templates
3. **Notificar colaborador** quando eventos são criados
4. **Permitir RH** editar eventos de colaboradores
5. **Dashboard de agendas** para RH ver todas as agendas

---

## 🐛 Troubleshooting

### "401 Unauthorized" ao acessar templates
- **Causa**: Usuário não é RH
- **Solução**: Apenas HR pode acessar `/api/admin/event-templates`

### "Nenhum evento agendado"
- **Causa**: Templates não foram aplicados ao usuário
- **Solução**: RH precisa aplicar templates via API

### Templates aparecem mas eventos não
- **Causa**: Confusão entre templates e eventos
- **Solução**: Templates são modelos, eventos são compromissos reais
