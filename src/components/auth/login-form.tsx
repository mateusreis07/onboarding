"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginValues } from "@/lib/schemas/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [error, setError] = useState("")
  const router = useRouter()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginValues) {
    setError("")
    try {
      // We use the NextAuth signIn function.
      // "credentials" is the provider id we defined in auth.ts
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // We handle redirection manually to check for errors first
      })

      if (result?.error) {
        setError("E-mail ou senha inválidos")
      } else {
        router.push("/dashboard") // Default redirect, middleware will handle role specifics if needed
        router.refresh()
      }
    } catch (e) {
      setError("Ocorreu um erro inesperado")
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Digite suas credenciais para acessar o sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="nome@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
