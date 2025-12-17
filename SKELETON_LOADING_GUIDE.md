# Skeleton Loading - Guia de Implementação

Este guia mostra como adicionar skeleton loading nas páginas principais do sistema.

## ✅ Já Implementado

### `/dashboard/tasks`
- Skeleton com card de progresso
- 3 cards de tarefas simuladas
- Layout completo com títulos e descrições

## 📝 Para Implementar

### 1. `/dashboard/documents`

Adicione no início do arquivo:
```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

Substitua o loading state (procure por `if (loading)`) por:
```tsx
if (loading) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 2. `/dashboard/policies`

```tsx
import { Skeleton } from "@/components/ui/skeleton"

if (loading) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 3. `/dashboard/calendar`

```tsx
import { Skeleton } from "@/components/ui/skeleton"

if (loading) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 4. `/dashboard/feedback`

```tsx
import { Skeleton } from "@/components/ui/skeleton"

if (loading) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Tabs defaultValue="pending">
        <Skeleton className="h-10 w-64 mb-6" />

        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
```

### 5. `/dashboard` (Main Dashboard)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

// Adicione no início da função, antes do return principal:
if (loading) {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <Skeleton className="h-48 w-full rounded-3xl" />

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## 🎨 Dicas de Personalização

1. **Altura dos Skeletons**: Use classes Tailwind como `h-4`, `h-6`, `h-8` para diferentes tamanhos
2. **Largura**: Use `w-32`, `w-48`, `w-64`, `w-full`, `w-1/2`, `w-3/4` etc.
3. **Arredondamento**: Adicione `rounded`, `rounded-lg`, `rounded-full` conforme necessário
4. **Quantidade**: Ajuste o número de elementos no `.map()` para simular a quantidade real de dados

## ⚡ Performance

Os skeletons são leves e não afetam a performance. Eles aparecem instantaneamente enquanto os dados reais são carregados, melhorando a percepção de velocidade do usuário.
