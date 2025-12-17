
// Simulated Company Knowledge Base
const KNOWLEDGE_BASE = `
POLÍTICA DE FÉRIAS:
- O colaborador tem direito a 30 dias de férias após completar 12 meses de trabalho (período aquisitivo).
- As férias podem ser fracionadas em até 3 períodos, sendo que um deles não pode ser inferior a 14 dias corridos e os demais não podem ser inferiores a 5 dias corridos.
- É necessário solicitar as férias com pelo menos 30 dias de antecedência através do portal do colaborador.

BENEFÍCIOS:
- Vale Refeição/Alimentação: R$ 50,00 por dia útil, depositado no cartão Flash.
- Plano de Saúde: Unimed Nacional (Coparticipativo), extensível a dependentes diretos.
- Gympass: Disponível a partir do 1º dia, com subsídio de 70% da empresa.
- Auxílio Home Office: R$ 150,00 mensais para ajuda de custo (energia/internet).

DRESS CODE (CÓDIGO DE VESTIMENTA):
- Estilo Casual no dia a dia. Jeans e camisetas são bem-vindos.
- Bermudas são permitidas às sextas-feiras ("Casual Friday").
- Em reuniões com clientes externos, recomenda-se traje Esporte Fino.

MODELO DE TRABALHO:
- Híbrido: 3 dias presenciais (Terça a Quinta) e 2 dias remotos (Segunda e Sexta).
- Horário flexível: Entrada entre 08:00 e 10:00, cumprindo 8 horas diárias + 1h de almoço.

ONBOARDING E TREINAMENTOS:
- O processo de onboarding dura 30 dias.
- É obrigatório completar os cursos de "Cultura e Valores" e "Segurança da Informação" na primeira semana.
`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function processChatRequest(userMessage: string, history: ChatMessage[]) {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const query = userMessage.toLowerCase()

  // Simple keyword matching "RAG" simulation
  let response = "Desculpe, não encontrei informações específicas sobre isso no meu banco de dados. Pode reformular a pergunta ou procurar o RH."

  if (query.includes('férias') || query.includes('descanso')) {
    response = "Sobre as **Férias**:\n" +
      "- Direito a 30 dias após 12 meses.\n" +
      "- Pode dividir em 3 períodos (um de min. 14 dias).\n" +
      "- Solicitar com 30 dias de antecedência."
  }
  else if (query.includes('benefício') || query.includes('vale') || query.includes('saúde') || query.includes('gympass')) {
    response = "Nossos **Benefícios** incluem:\n" +
      "- **Vale Refeição/Alimentação**: R$ 50,00/dia (Flash).\n" +
      "- **Plano de Saúde**: Unimed Nacional.\n" +
      "- **Gympass**: Com subsídio de 70%.\n" +
      "- **Auxílio Home Office**: R$ 150,00 mensais."
  }
  else if (query.includes('roupa') || query.includes('vestimenta') || query.includes('dress') || query.includes('bermuda')) {
    response = "Sobre o **Dress Code**:\n" +
      "- **Casual**: Jeans e camiseta no dia a dia.\n" +
      "- **Sextas**: Bermudas permitidas.\n" +
      "- **Clientes**: Recomenda-se Esporte Fino em reuniões."
  }
  else if (query.includes('horário') || query.includes('híbrido') || query.includes('presencial') || query.includes('remoto')) {
    response = "Nosso modelo é **Híbrido**:\n" +
      "- **Presencial**: Terça, Quarta e Quinta.\n" +
      "- **Remoto**: Segunda e Sexta.\n" +
      "- **Horário Flexível**: Entrada entre 08:00 e 10:00."
  }
  else if (query.includes('onboarding') || query.includes('treinamento')) {
    response = "Sobre o **Onboarding**:\n" +
      "Dura 30 dias. Não esqueça dos cursos de Cultura e Segurança na primeira semana!"
  }
  else if (query.includes('olá') || query.includes('oi') || query.includes('bom dia')) {
    response = "Olá! Eu sou o assistente virtual do Onboarding. Posso te ajudar com dúvidas sobre férias, benefícios, dress code e muito mais. O que gostaria de saber?"
  }

  return response
}
