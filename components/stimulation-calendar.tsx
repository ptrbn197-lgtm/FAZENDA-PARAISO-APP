"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus, Droplet, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getStimulationRecords, addStimulationRecord, deleteStimulationRecord } from "@/lib/storage"
import { TREE_INVENTORY_DATA } from "@/lib/tree-data"
import type { StimulationRecord } from "@/lib/types"

export function StimulationCalendar() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [records, setRecords] = useState<StimulationRecord[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    workerName: "",
    workerId: "",
    taskSection: "",
    applicationDate: "", // Iniciar vazio para evitar mismatch
    notes: "",
  })

  const loadRecords = async () => {
    try {
      setLoading(true)
      const data = await getStimulationRecords()
      setRecords(data)
    } catch (error) {
      console.error("Failed to load stimulation records", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    setFormData(prev => ({ ...prev, applicationDate: new Date().toISOString().split("T")[0] }))
    loadRecords()

    const handleDataUpdate = () => {
      loadRecords()
    }

    window.addEventListener("dataUpdated", handleDataUpdate)
    window.addEventListener("storage-update", handleDataUpdate)
    return () => {
      window.removeEventListener("dataUpdated", handleDataUpdate)
      window.removeEventListener("storage-update", handleDataUpdate)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para registrar uma aplicação.",
        variant: "destructive",
      })
      return
    }

    try {
      const record: StimulationRecord = {
        id: `stim-${Date.now()}`,
        taskSection: formData.taskSection,
        workerName: formData.workerName,
        workerId: formData.workerId,
        applicationDate: formData.applicationDate,
        notes: formData.notes,
        registeredBy: user.id,
        registeredByName: user.name,
        createdAt: new Date().toISOString(),
      }

      await addStimulationRecord(record)

      toast({
        title: "Sucesso!",
        description: "Aplicação de Ethrel registrada com sucesso.",
      })

      loadRecords()
      setIsDialogOpen(false)
      setFormData({
        workerName: "",
        workerId: "",
        taskSection: "",
        applicationDate: new Date().toISOString().split("T")[0],
        notes: "",
      })
    } catch (error) {
      console.error("Error submitting stimulation record:", error)
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao salvar os dados. Verifique sua conexão.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (recordId: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      await deleteStimulationRecord(recordId)
      loadRecords()
    }
  }

  const handleWorkerChange = (workerId: string) => {
    const worker = TREE_INVENTORY_DATA.find((w) => w.id === workerId)
    if (worker) {
      setFormData({
        ...formData,
        workerId: worker.id,
        workerName: worker.workerName,
        taskSection: "",
      })
    }
  }

  const getAvailableSections = () => {
    if (!formData.workerId) return []
    const worker = TREE_INVENTORY_DATA.find((w) => w.id === formData.workerId)
    return worker?.sections.map((s) => s.section) || []
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getRecordsForDate = (date: string) => {
    return records.filter((r) => r.applicationDate === date)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

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

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-5xl font-black text-gradient tracking-tighter flex items-center gap-4">
            <Droplet className="h-8 w-8 sm:h-12 sm:w-12 text-primary shrink-0" />
            Controle de Estimulação
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 font-medium mt-1">Gestão de aplicação de Ethrel por trabalhador e tarefa</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="premium-gradient shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-8 font-black uppercase tracking-wider h-14 w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Nova Aplicação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Aplicação de Ethrel</DialogTitle>
              <DialogDescription>Selecione o trabalhador e a tarefa para registrar estimulação</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="worker" className="text-base">1. Trabalhador</Label>
                <Select value={formData.workerId} onValueChange={handleWorkerChange} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o trabalhador" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREE_INVENTORY_DATA.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.workerName} ({worker.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section" className="text-base">2. Tarefa (E1, E2, E3, E4)</Label>
                <Select
                  value={formData.taskSection}
                  onValueChange={(value) => setFormData({ ...formData, taskSection: value })}
                  required
                  disabled={!formData.workerId}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a tarefa/seção" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSections().map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.workerId && (
                  <p className="text-xs text-muted-foreground">Selecione um trabalhador primeiro</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-base">3. Data da Aplicação</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">4. Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre a aplicação..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="text-base"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base">
                Registrar Aplicação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Navigation */}
      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <CardHeader className="pb-8 border-b border-primary/5 bg-primary/[0.02]">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="rounded-xl hover:bg-primary/10">
              <ChevronLeft className="h-6 w-6 text-primary" />
            </Button>
            <CardTitle className="text-xl sm:text-2xl font-black text-gradient uppercase tracking-widest">
              {monthNames[month]} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl hover:bg-primary/10">
              <ChevronRight className="h-6 w-6 text-primary" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {dayNames.map((day) => (
              <div key={day} className="text-center font-black text-[10px] sm:text-xs p-2 text-primary/40 uppercase tracking-widest">
                {day}
              </div>
            ))}

            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 min-h-24 sm:min-h-32 border border-transparent"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const dayRecords = getRecordsForDate(dateStr)
              const isToday = dateStr === new Date().toISOString().split("T")[0]

              return (
                <div
                  key={day}
                  className={`p-2 min-h-24 sm:min-h-32 border-2 rounded-2xl transition-all ${isToday
                    ? "border-primary bg-primary/5 shadow-inner"
                    : "border-primary/5 hover:border-primary/20 bg-white/[0.02]"
                    } ${dayRecords.length > 0 ? "bg-secondary/[0.05] border-secondary/20" : ""}`}
                >
                  <div className={`font-black text-sm sm:text-lg mb-2 ${isToday ? "text-primary" : "text-foreground/40"}`}>{day}</div>
                  <div className="space-y-1.5">
                    {dayRecords.map((record) => (
                      <div
                        key={record.id}
                        className="text-[9px] sm:text-[10px] bg-primary text-white font-black uppercase rounded-lg px-2 py-1 flex items-center justify-between gap-1 shadow-md hover:scale-105 transition-transform"
                      >
                        <span className="truncate">{record.taskSection}</span>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="hover:text-white/80 transition-colors"
                        >
                          <X className="h-2 w-2 sm:h-3 sm:w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card className="glass-panel border-none shadow-2xl">
        <CardHeader className="pb-8 border-b border-primary/5">
          <CardTitle className="text-2xl font-black text-gradient">Histórico de Aplicações</CardTitle>
          <CardDescription className="text-base font-medium">Registro cronológico de todas as estimulações</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando dados...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Droplet className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma aplicação registrada ainda</p>
              </div>
            ) : (
              records
                .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
                .map((record) => (
                  <div key={record.id} className="glass-panel border-primary/5 rounded-2xl p-6 card-hover group flex items-start justify-between gap-6">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black text-sm border border-primary/10 uppercase tracking-wider">
                          {record.taskSection}
                        </div>
                        <span className="font-black text-xl tracking-tight text-foreground/90 uppercase truncate">{record.workerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(record.applicationDate + "T00:00:00").toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {record.notes && (
                        <div className="bg-primary/[0.03] p-4 rounded-xl border border-primary/5 font-medium leading-relaxed italic text-foreground/80">
                          "{record.notes}"
                        </div>
                      )}
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Registrado por: {record.registeredByName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                      className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl shrink-0"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
