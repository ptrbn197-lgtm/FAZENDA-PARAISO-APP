"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getMonthlyWeighings, addMonthlyWeighing, getUsers } from "@/lib/storage"
import type { MonthlyWeighing, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, TrendingUp, Calendar, Scale } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ProductionRecording() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [weighings, setWeighings] = useState<MonthlyWeighing[]>([])
  const [workers, setWorkers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedWorkerId, setSelectedWorkerId] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [productionKg, setProductionKg] = useState("")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const handleDataUpdate = () => {
      loadData()
    }

    // Custom event dispatch by storage.ts
    window.addEventListener("dataUpdated", handleDataUpdate)

    return () => {
      window.removeEventListener("dataUpdated", handleDataUpdate)
    }
  }, [user, filterMonth])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allWeighings, allUsers] = await Promise.all([
        getMonthlyWeighings(),
        getUsers()
      ])

      const allWorkers = allUsers.filter((u) => u.role === "worker")
      setWorkers(allWorkers)

      // List weighings: Filtered by role/user for personal view
      let filtered = allWeighings

      // Se for trabalhador, mostrar apenas suas pesagens no histórico/cards
      if (user?.role === "worker") {
        filtered = filtered.filter((w) => w.workerId === user.id)
      }

      // Filtrar por mês se selecionado
      if (filterMonth !== "all") {
        filtered = filtered.filter((w) => w.month === filterMonth)
      }

      setWeighings(filtered.sort((a, b) => b.month.localeCompare(a.month)))
    } catch (error) {
      console.error("Failed to load production data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterWeighing = async () => {
    if (!selectedWorkerId || !selectedMonth || !productionKg) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    const kg = Number.parseFloat(productionKg)
    if (isNaN(kg) || kg <= 0) {
      toast({
        title: "Erro",
        description: "Informe uma produção válida em kg",
        variant: "destructive",
      })
      return
    }

    const worker = workers.find((w) => w.id === selectedWorkerId)
    if (!worker) return

    // Verificar se já existe pesagem para este trabalhador neste mês
    const existingWeighing = weighings.find((w) => w.workerId === selectedWorkerId && w.month === selectedMonth)

    if (existingWeighing) {
      toast({
        title: "Erro",
        description: "Já existe uma pesagem para este trabalhador neste mês",
        variant: "destructive",
      })
      return
    }

    const newWeighing: MonthlyWeighing = {
      id: `weighing-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      month: selectedMonth,
      productionKg: kg,
      registeredBy: user?.id || "unknown", // Using user ID correctly for Supabase RLS context
      registeredByName: user?.name || "Usuário",
      createdAt: new Date().toISOString(),
    }

    await addMonthlyWeighing(newWeighing)

    // loadData is triggered by event listener in storage.ts addMonthlyWeighing
    // But we can also call it manually to be safe for UI feedback
    loadData()

    setIsDialogOpen(false)
    setSelectedWorkerId("")
    setSelectedMonth("")
    setProductionKg("")

    toast({
      title: "Pesagem registrada",
      description: `${kg}kg registrados para ${worker.name} em ${formatMonth(selectedMonth)}`,
    })
  }

  const formatMonth = (month: string) => {
    if (!month) return ""
    const [year, monthNum] = month.split("-")
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]
    return `${monthNames[Number.parseInt(monthNum) - 1]} ${year}`
  }

  const getTotalProduction = () => {
    return weighings.reduce((sum, w) => sum + w.productionKg, 0)
  }

  const getAverageProduction = () => {
    if (weighings.length === 0) return 0
    return weighings.reduce((sum, w) => sum + w.productionKg, 0) / weighings.length
  }

  const getUniqueMonths = () => {
    const months = new Set(weighings.map((w) => w.month))
    return Array.from(months).sort().reverse()
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  const getAvailableMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      months.push(monthStr)
    }
    return months
  }

  const uniqueMonths = getUniqueMonths()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produção</h2>
          <p className="text-muted-foreground">Pesagem mensal de borracha natural</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {uniqueMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Registrar Pesagem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Pesagem</DialogTitle>
                <DialogDescription>Registre a produção de um trabalhador</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="worker">Seringueiro</Label>
                  <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                    <SelectTrigger id="worker">
                      <SelectValue placeholder="Selecione o trabalhador" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Mês de Referência</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonths().map((month) => (
                        <SelectItem key={month} value={month}>
                          {formatMonth(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="production">Produção (kg)</Label>
                  <div className="relative">
                    <Input
                      id="production"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={productionKg}
                      onChange={(e) => setProductionKg(e.target.value)}
                    />
                    <Scale className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <Button onClick={handleRegisterWeighing} className="w-full">
                Confirmar Registro
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produzido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : getTotalProduction().toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">{weighings.length} registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : getAverageProduction().toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">Sua produtividade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesagens no Mês</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weighings.filter((w) => w.month === getCurrentMonth()).length}
            </div>
            <p className="text-xs text-muted-foreground">{formatMonth(getCurrentMonth())}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pesagens</CardTitle>
          <CardDescription>
            Registro mensal de produção de borracha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weighings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma pesagem registrada
            </div>
          ) : (
            <div className="space-y-4">
              {weighings.map((weighing) => (
                <div
                  key={weighing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{weighing.workerName}</p>
                        <Badge variant="secondary">{formatMonth(weighing.month)}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registrado em {new Date(weighing.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{weighing.productionKg} kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
