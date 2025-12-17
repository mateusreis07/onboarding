# 🚀 Como Atualizar Agendas Após Mudar Templates

## Problema
Você editou um template (ex: mudou "Treinamento Técnico" de "EMPLOYEE" para "Todos"), mas os eventos já criados **não mudaram automaticamente**.

## Por quê?
- **Templates** = Receitas (modelos)
- **Eventos** = Produtos finais (já criados)
- Mudar a receita não muda os produtos já feitos

## ✅ Solução Rápida

### Opção 1: Recriar TODAS as Agendas (Recomendado)
1. Acesse **Gestão → Templates de Eventos**
2. Clique no botão **"Recriar Todas as Agendas"**
3. Confirme a ação
4. ✅ Todas as agendas serão recriadas com os templates atualizados

### Opção 2: Recriar Agenda de UM Usuário Específico
```javascript
// Via API
POST /api/admin/calendar/recreate
{
  "userId": "id-do-usuario"
}
```

## ⚠️ Importante
- Ao recriar, **todos os eventos antigos são deletados**
- Eventos **personalizados** criados pelo usuário também serão removidos
- Sincronizações com Google/Outlook serão perdidas

## 📋 Fluxo Recomendado

### Quando Mudar Templates:
1. Edite o template
2. Clique em "Recriar Todas as Agendas"
3. Avise os colaboradores que a agenda foi atualizada

### Quando Criar Novo Colaborador:
1. Crie o usuário no sistema
2. Os templates serão aplicados automaticamente
3. Ou use a API `/api/admin/event-templates/apply`

## 🎯 Exemplo Prático

**Cenário:** Você mudou "Treinamento Técnico" para aparecer para TODOS

**Antes:**
- João (EMPLOYEE) → tinha o evento ✅
- Maria (HR) → NÃO tinha o evento ❌

**Depois de "Recriar Todas as Agendas":**
- João (EMPLOYEE) → tem o evento ✅
- Maria (HR) → **agora tem o evento** ✅

---

## 🔄 Alternativa: Aplicar Templates Manualmente

Se você quiser aplicar templates apenas para usuários novos (sem deletar eventos existentes):

```javascript
POST /api/admin/event-templates/apply
{
  "userId": "id-do-usuario",
  "startDate": "2024-12-13"
}
```

Isso **adiciona** novos eventos sem deletar os antigos.
