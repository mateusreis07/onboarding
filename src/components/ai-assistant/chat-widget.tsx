"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o Assistente Virtual do RH. Posso tirar dúvidas sobre férias, benefícios, dress code e processos da empresa. Como posso ajudar?' }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages
        })
      })

      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: "Desculpe, tive um problema ao processar sua pergunta. Tente novamente." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <Card className="w-[350px] shadow-2xl border-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-base">Assistente RH</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary-foreground/20 text-primary-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] flex flex-col">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex w-full items-start gap-2",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar className="h-8 w-8 border bg-primary/10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">IA</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {/* Simple line break support */}
                        {msg.content.split('\n').map((line, i) => (
                          <p key={i} className={cn(line.startsWith('-') && "pl-2", "min-h-[1.2em]")}>
                            {line}
                          </p>
                        ))}
                      </div>

                      {msg.role === 'user' && (
                        <Avatar className="h-8 w-8 border bg-slate-200">
                          <AvatarFallback className="text-xs text-slate-700">VC</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex w-full items-start gap-2 justify-start">
                      <Avatar className="h-8 w-8 border bg-primary/10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">IA</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <span className="animate-pulse">Digitando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-background">
                <form
                  className="flex gap-2"
                  onSubmit={handleSubmit}
                >
                  <Input
                    placeholder="Digite sua dúvida..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110",
          isOpen && "rotate-90 hidden" // Hide button when open (optional, or keeping it to toggle)
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {!isOpen ? <MessageCircle className="h-8 w-8" /> : <X className="h-6 w-6" />}
      </Button>

      {/* Floating Button when open (alternative: keeping the original button visible but changed icon) */}
      {isOpen && (
        <div className="h-1" /> // Spacer
      )}
    </div>
  )
}
