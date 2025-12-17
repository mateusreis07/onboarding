// Basic local AI simulation for feedback analysis
// In production, this would call OpenAI/Gemini API

interface AIAnalysisResult {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  score: number // 0-100
  summary: string
}

export async function analyzeFeedback(content: Record<string, string>): Promise<AIAnalysisResult> {
  // Combine all answers into one text for analysis
  const text = Object.values(content).join(' ').toLowerCase()

  const positiveWords = ['excelente', 'bom', 'ótimo', 'feliz', 'rápido', 'gostei', 'aprendi', 'fácil', 'ajuda', 'suporte', 'claro', 'motivado']
  const negativeWords = ['difícil', 'ruim', 'demorado', 'confuso', 'perdido', 'falta', 'problema', 'não entendi', 'sozinho', 'triste', 'frustrado']

  let score = 50 // Base score
  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach(word => {
    if (text.includes(word)) {
      score += 5
      positiveCount++
    }
  })

  negativeWords.forEach(word => {
    if (text.includes(word)) {
      score -= 5
      negativeCount++
    }
  })

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL'
  if (score > 65) sentiment = 'POSITIVE'
  if (score < 35) sentiment = 'NEGATIVE'

  // Generate a mock summary based on keywords
  let summary = "O colaborador apresenta uma adaptação "
  if (sentiment === 'POSITIVE') summary += "muito positiva, demonstrando engajamento e clareza nos processos. "
  else if (sentiment === 'NEGATIVE') summary += "com desafios, indicando necessidade de atenção em alguns pontos críticos. "
  else summary += "dentro do esperado, com alguns pontos de atenção mas evolução constante. "

  if (text.includes('cultura') || text.includes('valores')) {
    summary += "Demonstra bom alinhamento com a cultura da empresa. "
  }
  if (text.includes('técnico') || text.includes('ferramenta')) {
    summary += "Menciona aspectos técnicos do trabalho. "
  }
  if (text.includes('equipe') || text.includes('time')) {
    summary += "Parece estar se integrando bem com a equipe. "
  }

  return {
    sentiment,
    score,
    summary
  }
}
