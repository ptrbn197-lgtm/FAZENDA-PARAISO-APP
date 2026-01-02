"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { User, Shield, Users } from "lucide-react"
import Image from "next/image"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao sistema!",
      })
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleQuickLogin = async (username: string) => {
    setIsLoading(true)
    // Usamos senha padrão '123456' para garantir que passe na validação de 6 dígitos
    const success = await login(username, "123456")

    if (success) {
      toast({
        title: "Acesso realizado",
        description: `Bem-vindo, ${username}!`,
      })
    }
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center">
            <Image
              src="/images/logo-fazenda-paraiso.png"
              alt="Logo Fazenda Paraíso"
              width={60}
              height={60}
              className="object-contain brightness-0 invert"
            />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Seringal Fazenda Paraíso</CardTitle>
        <CardDescription className="text-center">
          Sistema de Gestão e Produção de Borracha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Usuário</Label>
            <Input
              id="email"
              type="text"
              placeholder="Digite seu nome"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Acessando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs font-medium text-center text-muted-foreground mb-4">
            Acesso Rápido
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("admin")}
                disabled={isLoading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Administração
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("fiscal")}
                disabled={isLoading}
              >
                <Users className="h-4 w-4 mr-2" />
                Fiscalização
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["anderson", "valdeci", "aquiles", "patrick", "michael", "messias", "zuzueli"].map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin(name)}
                  disabled={isLoading}
                  className="capitalize"
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
