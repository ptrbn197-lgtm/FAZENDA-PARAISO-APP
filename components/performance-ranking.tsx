"use client"

import { useState, useEffect } from "react"
import { getPerformanceRatings, savePerformanceRating, deletePerformanceRating } from "@/lib/storage"
import { getWorkerInventory } from "@/lib/tree-data"
import type { WorkerPerformanceRating } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Plus, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function PerformanceRanking() {
  const [ratings, setRatings] = useState<WorkerPerformanceRating[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRating, setEditingRating] = useState<WorkerPerformanceRating | null>(null)

  const [formData, setFormData] = useState({
    workerId: "",
    workerName: "",
    productionScore: 5,
    qualityScore: 5,
    disciplineScore: 5,
    notes: "",
  })

  useEffect(() => {
    loadRatings()

    const handleStorageChange = () => {
      loadRatings()
    }

    const handleCustomStorageUpdate = () => {
      loadRatings()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("localStorageUpdate", handleCustomStorageUpdate)

    const intervalId = setInterval(() => {
      loadRatings()
    }, 2000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("localStorageUpdate", handleCustomStorageUpdate)
      clearInterval(intervalId)
    }
  }, [])

  const loadRatings = async () => {
    const allRatings = await getPerformanceRatings()
    setRatings(allRatings)
  }

  const monthRatings = ratings.filter((r) => r.month === selectedMonth).sort((a, b) => b.overallScore - a.overallScore)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <Award className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            <Trophy className="h-3 w-3 mr-1" />
            1º Lugar
          </Badge>
        )
      case 2:
        return (
          <Badge className="bg-gray-400 text-white hover:bg-gray-500">
            <Medal className="h-3 w-3 mr-1" />
            2º Lugar
          </Badge>
        )
      case 3:
        return (
          <Badge className="bg-amber-600 text-white hover:bg-amber-700">
            <Medal className="h-3 w-3 mr-1" />
            3º Lugar
          </Badge>
        )
      default:
        return <Badge variant="outline">{rank}º Lugar</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-blue-600"
    if (score >= 4) return "text-yellow-600"
    return "text-red-600"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMonthlyEvolutionData = () => {
    const monthlyAverages = new Map<
      string,
      { production: number; quality: number; discipline: number; count: number }
    >()

    ratings.forEach((r) => {
      const existing = monthlyAverages.get(r.month) || { production: 0, quality: 0, discipline: 0, count: 0 }
      monthlyAverages.set(r.month, {
        production: existing.production + r.productionScore,
        quality: existing.quality + r.qualityScore,
        discipline: existing.discipline + r.disciplineScore,
        count: existing.count + 1,
      })
    })

    return Array.from(monthlyAverages.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Últimos 6 meses
      .map(([month, data]) => ({
        month: month.slice(5), // "01" from "2025-01"
        production: (data.production / data.count).toFixed(1),
        quality: (data.quality / data.count).toFixed(1),
        discipline: (data.discipline / data.count).toFixed(1),
      }))
  }

  const openDialog = (rating?: WorkerPerformanceRating) => {
    if (rating) {
      setEditingRating(rating)
      setFormData({
        workerId: rating.workerId,
        workerName: rating.workerName,
        productionScore: rating.productionScore,
        qualityScore: rating.qualityScore,
        disciplineScore: rating.disciplineScore,
        notes: rating.notes || "",
      })
    } else {
      setEditingRating(null)
      setFormData({
        workerId: "",
        workerName: "",
        productionScore: 5,
        qualityScore: 5,
        disciplineScore: 5,
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveRating = () => {
    if (!formData.workerId || !formData.workerName) {
      alert("Selecione um seringueiro")
      return
    }

    const overallScore = formData.productionScore * 0.4 + formData.qualityScore * 0.4 + formData.disciplineScore * 0.2

    const newRating: WorkerPerformanceRating = {
      id: editingRating?.id || `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workerId: formData.workerId,
      workerName: formData.workerName,
      month: selectedMonth,
      productionScore: formData.productionScore,
      qualityScore: formData.qualityScore,
      disciplineScore: formData.disciplineScore,
      overallScore: overallScore,
      notes: formData.notes,
      ratedBy: "user",
      ratedByName: "Usuário",
      createdAt: editingRating?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    savePerformanceRating(newRating)
    setIsDialogOpen(false)
    loadRatings()
  }

  const handleDeleteRating = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
      deletePerformanceRating(id)
      loadRatings()
    }
  }

  const workers = getWorkerInventory()

  const monthlyEvolutionData = getMonthlyEvolutionData()

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-5xl font-black text-gradient tracking-tighter uppercase italic">Ranking de Performance</h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 font-medium mt-1">Reconhecimento e avaliação contínua dos melhores profissionais</p>
        </div>
        <Button onClick={() => openDialog()} size="lg" className="premium-gradient shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-8 font-black uppercase tracking-wider h-14 w-full sm:set-auto shrink-0">
          <Plus className="h-5 w-5 mr-3" />
          Nova Avaliação
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Período de Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="max-w-full sm:max-w-xs"
          />
        </CardContent>
      </Card>

      {monthRatings.length >= 3 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 items-end">
          {/* 2nd Place */}
          <Card className="glass-panel border-none shadow-xl border-t-4 border-gray-400/30 sm:order-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Medal className="h-24 w-24 text-gray-400" />
            </div>
            <CardHeader className="text-center pb-4 pt-10">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-gray-400/10 border border-gray-400/20 shadow-inner">
                  <Medal className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Vice-Campeão</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 pb-10">
              <Avatar className="h-24 w-24 mx-auto border-4 border-gray-400/20 shadow-xl">
                <AvatarFallback className="text-2xl font-black bg-gray-400/10 text-gray-500">
                  {getInitials(monthRatings[1].workerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-xl tracking-tight text-foreground/90 uppercase truncate px-2">{monthRatings[1].workerName}</p>
                <div className={`text-4xl font-black mt-2 ${getScoreColor(monthRatings[1].overallScore)}`}>
                  {monthRatings[1].overallScore.toFixed(1)}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">pontuação mensal</p>
              </div>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="glass-panel border-none shadow-2xl border-t-8 border-yellow-500 sm:order-2 relative overflow-hidden group scale-105 z-10">
            <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="h-32 w-32 text-yellow-500" />
            </div>
            <CardHeader className="text-center pb-4 pt-12 relative">
              <div className="flex justify-center mb-6">
                <div className="p-5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30 animate-pulse">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg font-black uppercase tracking-[0.3em] text-yellow-600">Grande Campeão</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 pb-12 relative">
              <Avatar className="h-32 w-32 mx-auto border-4 border-yellow-500 shadow-2xl">
                <AvatarFallback className="text-4xl font-black bg-yellow-500 text-white">
                  {getInitials(monthRatings[0].workerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-2xl tracking-tighter text-foreground uppercase truncate px-4">{monthRatings[0].workerName}</p>
                <div className={`text-6xl font-black mt-3 drop-shadow-sm ${getScoreColor(monthRatings[0].overallScore)}`}>
                  {monthRatings[0].overallScore.toFixed(1)}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-700/60 mt-2">Elite da Safra</p>
              </div>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="glass-panel border-none shadow-xl border-t-4 border-amber-600/30 sm:order-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award className="h-24 w-24 text-amber-600" />
            </div>
            <CardHeader className="text-center pb-4 pt-10">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-amber-600/10 border border-amber-600/20 shadow-inner">
                  <Medal className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-700/80">3º Colocado</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 pb-10">
              <Avatar className="h-24 w-24 mx-auto border-4 border-amber-600/20 shadow-xl">
                <AvatarFallback className="text-2xl font-black bg-amber-600/10 text-amber-700">
                  {getInitials(monthRatings[2].workerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-xl tracking-tight text-foreground/90 uppercase truncate px-2">{monthRatings[2].workerName}</p>
                <div className={`text-4xl font-black mt-2 ${getScoreColor(monthRatings[2].overallScore)}`}>
                  {monthRatings[2].overallScore.toFixed(1)}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">pontuação mensal</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <CardHeader className="pb-8 border-b border-primary/5 bg-primary/[0.02]">
          <CardTitle className="text-2xl font-black text-gradient uppercase tracking-widest">Ranking Completo</CardTitle>
          <CardDescription className="text-base font-medium">Avaliação ponderada: Produção 40%, Qualidade 40% e Disciplina 20%</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {monthRatings.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-10" />
              <p className="font-medium">Nenhuma avaliação registrada para este mês</p>
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {monthRatings.map((rating, index) => (
                <div
                  key={rating.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 sm:p-8 hover:bg-primary/[0.02] transition-colors relative group"
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      {index < 3 ? getRankIcon(index + 1) : (
                        <span className="text-xl font-black text-muted-foreground/30">{index + 1}º</span>
                      )}
                    </div>
                    <Avatar className="h-14 w-14 shrink-0 shadow-lg border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/5 text-primary font-black">{getInitials(rating.workerName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xl tracking-tight text-foreground/90 uppercase truncate">{rating.workerName}</p>
                      <div className="flex gap-2 mt-2">
                        <div className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em]">ID: {rating.workerId}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-8 bg-primary/[0.03] sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-primary/5 sm:border-none">
                    <div className="text-left sm:text-right">
                      <p className={`text-4xl font-black ${getScoreColor(rating.overallScore)}`}>
                        {rating.overallScore.toFixed(1)}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">pontuação final</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="space-y-1">
                        <p className="font-black text-lg text-foreground/80">{rating.productionScore}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Prod</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-lg text-foreground/80">{rating.qualityScore}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Qual</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-lg text-foreground/80">{rating.disciplineScore}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Disc</p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-12 w-12 rounded-xl text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
                        onClick={() => openDialog(rating)}
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-12 w-12 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteRating(rating.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <CardHeader className="pb-8 border-b border-primary/5 bg-primary/[0.02]">
          <CardTitle className="text-xl font-black text-gradient uppercase tracking-widest">Evolução Mensal</CardTitle>
          <CardDescription className="text-base font-medium">Histórico de pontuação média por categoria</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyEvolutionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 12, fontWeight: 800 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 12, fontWeight: 800 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  padding: '16px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  fontSize: '10px'
                }}
              />
              <Legend verticalAlign="top" height={60} iconType="circle" />
              <Line
                type="monotone"
                dataKey="production"
                name="Produção"
                stroke="var(--primary)"
                strokeWidth={4}
                dot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="quality"
                name="Qualidade"
                stroke="var(--secondary)"
                strokeWidth={4}
                dot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="discipline"
                name="Disciplina"
                stroke="var(--accent)"
                strokeWidth={4}
                dot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRating ? "Editar Avaliação" : "Nova Avaliação"}</DialogTitle>
            <DialogDescription>Avalie o desempenho do seringueiro em cada categoria (0-10)</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Seringueiro</Label>
              <Select
                value={formData.workerId}
                onValueChange={(value) => {
                  const worker = workers.find((w) => w.id === value)
                  if (worker) {
                    setFormData({ ...formData, workerId: value, workerName: worker.workerName })
                  }
                }}
                disabled={!!editingRating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um seringueiro" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.workerName} - Código {worker.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Produção (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.productionScore}
                  onChange={(e) =>
                    setFormData({ ...formData, productionScore: Number.parseFloat(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">Peso 40%</p>
              </div>

              <div className="space-y-2">
                <Label>Qualidade (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.qualityScore}
                  onChange={(e) => setFormData({ ...formData, qualityScore: Number.parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">Peso 40%</p>
              </div>

              <div className="space-y-2">
                <Label>Disciplina (frequência, recuperação) (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.disciplineScore}
                  onChange={(e) =>
                    setFormData({ ...formData, disciplineScore: Number.parseFloat(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">Peso 20%</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Adicione comentários sobre o desempenho..."
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Pontuação Final:</p>
              <p className="text-3xl font-bold">
                {(
                  formData.productionScore * 0.4 +
                  formData.qualityScore * 0.4 +
                  formData.disciplineScore * 0.2
                ).toFixed(1)}
                /10
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRating}>{editingRating ? "Atualizar" : "Salvar"} Avaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
