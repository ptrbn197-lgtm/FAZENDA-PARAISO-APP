"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Download,
  Share2,
  UserCheck,
  UserX,
  CloudRain,
  RotateCcw,
  Trash2,
  CheckSquare,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import {
  getAttendanceRecords,
  saveAttendanceRecord,
  deleteAttendanceRecord,
  getInspections,
  addInspection,
} from "@/lib/storage"
import { getWorkerInventory } from "@/lib/tree-data"
import type { AttendanceRecord, WorkerTreeInventory, Inspection } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js"
// import { faker } from "@faker-js/faker"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `há ${seconds} segundo${seconds !== 1 ? "s" : ""}`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes} minuto${minutes !== 1 ? "s" : ""}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} hora${hours !== 1 ? "s" : ""}`
  const days = Math.floor(hours / 24)
  if (days < 30) return `há ${days} dia${days !== 1 ? "s" : ""}`
  const months = Math.floor(days / 30)
  if (months < 12) return `há ${months} ${months !== 1 ? "meses" : "mês"}`
  const years = Math.floor(months / 12)
  return `há ${years} ano${years !== 1 ? "s" : ""}`
}

const statusIcons = {
  "sangria-realizada": <UserCheck className="h-4 w-4" />,
  falta: <UserX className="h-4 w-4" />,
  "falta-chuva": <CloudRain className="h-4 w-4" />,
  "tarefa-recuperada": <RotateCcw className="h-4 w-4" />,
}

const statusLabels = {
  "sangria-realizada": "Sangria Realizada",
  falta: "Falta",
  "falta-chuva": "Falta por Chuva",
  "tarefa-recuperada": "Tarefa Recuperada",
}

const statusColors = {
  "sangria-realizada": "bg-green-500/10 text-green-700 border-green-500/20",
  falta: "bg-red-500/10 text-red-700 border-red-500/20",
  "falta-chuva": "bg-blue-500/10 text-blue-700 border-blue-500/20",
  "tarefa-recuperada": "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
}

export function AttendanceTracker() {
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [workers, setWorkers] = useState<WorkerTreeInventory[]>([])
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  // Form states
  const [selectedWorker, setSelectedWorker] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedStatus, setSelectedStatus] = useState<AttendanceRecord["status"]>("sangria-realizada")
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [rainfallMm, setRainfallMm] = useState<string>("") // Quantidade de chuva em mm
  const [notes, setNotes] = useState<string>("")

  // Inspection states
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [selectedWorkerForInspection, setSelectedWorkerForInspection] = useState<string>("")
  const [selectedTaskForInspection, setSelectedTaskForInspection] = useState<string>("")
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false)
  const [angle, setAngle] = useState([3])
  const [depth, setDepth] = useState([3])
  const [injuries, setInjuries] = useState([5])
  const [spoutCleanliness, setSpoutCleanliness] = useState([3])
  const [inspectionNotes, setInspectionNotes] = useState("")
  const [inspectionMonth, setInspectionMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    loadData()

    const handleStorageUpdate = () => loadData()
    window.addEventListener("storage-update", handleStorageUpdate)
    window.addEventListener("storage", handleStorageUpdate)

    const interval = setInterval(loadData, 2000)

    return () => {
      window.removeEventListener("storage-update", handleStorageUpdate)
      window.removeEventListener("storage", handleStorageUpdate)
      clearInterval(interval)
    }
  }, [])

  const loadData = async () => {
    try {
      const allRecords = await getAttendanceRecords()
      setRecords(allRecords)

      const inventory = getWorkerInventory() // This is still sync (static data)
      setWorkers(inventory)

      const insp = await getInspections()
      setInspections(insp)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Erro ao carregar dados",
        description: "Verifique sua conexão.",
        variant: "destructive"
      })
    }
  }

  const handleSaveRecord = async () => {
    if (!selectedWorker || !selectedDate) {
      toast({
        title: "Erro",
        description: "Selecione o trabalhador e a data",
        variant: "destructive",
      })
      return
    }

    if ((selectedStatus === "sangria-realizada" || selectedStatus === "tarefa-recuperada") && !selectedSection) {
      toast({
        title: "Erro",
        description: "Selecione a tarefa/seção",
        variant: "destructive",
      })
      return
    }

    const worker = workers.find((w) => w.workerName === selectedWorker)
    if (!worker) return

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.workerName,
      date: selectedDate,
      status: selectedStatus,
      taskSection: selectedSection || undefined,
      rainfallMm: rainfallMm ? parseFloat(rainfallMm) : undefined,
      notes: notes || undefined,
      registeredBy: "user",
      registeredByName: "Usuário",
      createdAt: new Date().toISOString(),
    }

    await saveAttendanceRecord(newRecord)
    loadData()

    toast({
      title: "Presença registrada",
      description: `${worker.workerName} - ${statusLabels[selectedStatus]}${selectedSection ? ` (${selectedSection})` : ""}`,
    })

    // Reset form
    setSelectedSection("")
    setRainfallMm("")
    setNotes("")
  }

  const handleDelete = async (id: string) => {
    await deleteAttendanceRecord(id)
    loadData()
    toast({
      title: "Registro excluído",
      description: "O registro de presença foi removido",
    })
  }

  const handleDownload = () => {
    const filtered = records.filter((r) => r.date.startsWith(filterMonth))
    const csv = [
      ["Data", "Trabalhador", "Status", "Seção", "Observações"].join(","),
      ...filtered.map((r) =>
        [r.date, r.workerName, statusLabels[r.status], r.taskSection || "", r.notes || ""].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `presenca-${filterMonth}.csv`
    a.click()
  }

  const handleShare = () => {
    const filtered = records.filter((r) => r.date.startsWith(filterMonth))
    const text =
      `📋 Registro de Presença - ${filterMonth}\n\n` +
      filtered
        .map(
          (r) => `${r.date} - ${r.workerName}\n${statusLabels[r.status]}${r.taskSection ? ` (${r.taskSection})` : ""}`,
        )
        .join("\n\n")

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `presenca-${filterMonth}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Registro salvo",
      description: "O arquivo foi baixado com sucesso",
    })
  }

  const openInspectionDialog = () => {
    if (!selectedWorkerForInspection || !selectedTaskForInspection) {
      toast({
        title: "Erro",
        description: "Selecione trabalhador e tarefa",
        variant: "destructive",
      })
      return
    }

    const worker = workers.find((w) => w.id === selectedWorkerForInspection)
    if (!worker) return

    setAngle([3])
    setDepth([3])
    setInjuries([5])
    setSpoutCleanliness([3])
    setInspectionNotes("")
    setIsInspectionDialogOpen(true)
  }

  const handleSubmitInspection = async () => {
    if (!selectedWorkerForInspection || !selectedTaskForInspection) return

    const worker = workers.find((w) => w.id === selectedWorkerForInspection)
    if (!worker) return

    const taskSection = selectedTaskForInspection
    const overallScore = (angle[0] + depth[0] + injuries[0] + spoutCleanliness[0]) / 4

    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      taskId: `${selectedWorkerForInspection}-${taskSection}-${Date.now()}`,
      inspectorId: "user",
      inspectorName: "Usuário",
      date: new Date().toISOString().split("T")[0],
      angle: angle[0],
      depth: depth[0],
      injuries: injuries[0],
      spoutCleanliness: spoutCleanliness[0],
      overallScore,
      notes: `${worker.workerName} - Tarefa ${selectedTaskForInspection}${inspectionNotes ? `: ${inspectionNotes}` : ""}`,
      createdAt: new Date().toISOString(),
    }

    await addInspection(newInspection)
    loadData()
    setIsInspectionDialogOpen(false)

    setSelectedWorkerForInspection("")
    setSelectedTaskForInspection("")

    toast({
      title: "Inspeção registrada com sucesso!",
      description: `${worker.workerName} - ${taskSection} - Nota: ${overallScore.toFixed(1)}/5.0`,
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-primary"
    if (score >= 3.5) return "text-secondary"
    if (score >= 2.5) return "text-accent"
    return "text-destructive"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 4.5)
      return (
        <Badge className="bg-primary text-primary-foreground">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Excelente
        </Badge>
      )
    if (score >= 3.5)
      return (
        <Badge className="bg-secondary text-secondary-foreground">
          <TrendingUp className="h-3 w-3 mr-1" />
          Bom
        </Badge>
      )
    if (score >= 2.5)
      return (
        <Badge className="bg-accent text-accent-foreground">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Regular
        </Badge>
      )
    return (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Precisa Melhorar
      </Badge>
    )
  }

  const filteredRecords = records.filter((r) => r.date.startsWith(filterMonth))
  const selectedWorkerData = workers.find((w) => w.workerName === selectedWorker)
  const availableSections = selectedWorkerData?.sections.map((s) => s.section) || []

  const selectedWorkerForInspectionData = workers.find((w) => w.id === selectedWorkerForInspection)
  const filteredInspections = inspections.filter((i) => i.date.startsWith(inspectionMonth))

  const [attendanceData, setAttendanceData] = useState<{ day: number; attendance: number }[]>([])

  useEffect(() => {
    // Gerar dados apenas no cliente para evitar hydration mismatch
    const daysInMonth = new Date(
      parseInt(filterMonth.split("-")[0]),
      parseInt(filterMonth.split("-")[1]),
      0
    ).getDate()

    // Preparar dados para o gráfico de presença
    setAttendanceData(Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      attendance: Math.floor(Math.random() * 10),
    })))
  }, [filterMonth])

  const attendanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Evolução da Presença",
      },
    },
  }

  const attendanceChartData = {
    labels: attendanceData.map((data) => `Dia ${data.day}`),
    datasets: [
      {
        label: "Presença",
        data: attendanceData.map((data) => data.attendance),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  }

  return (
    <div className="space-y-6" >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Registro de Presença</h2>
          <p className="text-muted-foreground text-base mt-1">Sangria, faltas, recuperações e inspeções</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="lg" onClick={handleDownload} className="flex-1 sm:flex-none bg-transparent">
            <Download className="h-5 w-5 mr-2" />
            Baixar
          </Button>
          <Button variant="outline" size="lg" onClick={handleShare} className="flex-1 sm:flex-none bg-transparent">
            <Share2 className="h-5 w-5 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="registro" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="registro" className="text-base py-3">
            <UserCheck className="h-5 w-5 mr-2" />
            Registro
          </TabsTrigger>
          <TabsTrigger value="inspecoes" className="text-base py-3">
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Inspeções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registro" className="space-y-8 mt-8">
          <Card className="glass-panel border-none shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-black text-gradient">Novo Registro</CardTitle>
              <CardDescription className="text-base font-medium">Registre a presença e atividades do dia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="worker" className="text-base font-semibold">
                  1. Selecione o Trabalhador
                </Label>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger id="worker" className="h-12 text-base">
                    <SelectValue placeholder="Escolha o trabalhador" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.workerName} className="text-base py-3">
                        {worker.workerName} ({worker.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base">
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base">
                    Status
                  </Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(v) => setSelectedStatus(v as AttendanceRecord["status"])}
                  >
                    <SelectTrigger id="status" className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-base py-3">
                          <div className="flex items-center gap-2">
                            {statusIcons[key as keyof typeof statusIcons]}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(selectedStatus === "sangria-realizada" || selectedStatus === "tarefa-recuperada") && selectedWorker && (
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-base font-semibold">
                    2. Selecione a Tarefa
                  </Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger id="section" className="h-12 text-base">
                      <SelectValue placeholder="Escolha qual tarefa (E1, E2, E3, E4)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((section) => (
                        <SelectItem key={section} value={section} className="text-base py-3">
                          Tarefa {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Selecione qual seção foi trabalhada hoje</p>
                </div>
              )}

              {selectedStatus === "falta-chuva" && (
                <div className="space-y-2">
                  <Label htmlFor="rainfall" className="text-base font-semibold">
                    Quantidade de Chuva (mm)
                  </Label>
                  <Input
                    id="rainfall"
                    type="number"
                    step="0.1"
                    min="0"
                    value={rainfallMm}
                    onChange={(e) => setRainfallMm(e.target.value)}
                    placeholder="Ex: 15.5"
                    className="h-12 text-base"
                  />
                  <p className="text-sm text-muted-foreground">Informe a quantidade de chuva em milímetros</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais..."
                  className="min-h-[100px] text-base"
                />
              </div>

              <Button onClick={handleSaveRecord} size="lg" className="w-full text-lg h-14 premium-gradient shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <CheckSquare className="h-6 w-6 mr-2" />
                Registrar Presença
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel border-none shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-2xl font-black text-gradient">Histórico de Registros</CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label htmlFor="filter-month" className="text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Filtrar mês:
                  </Label>
                  <Input
                    id="filter-month"
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="h-11 bg-background/50 border-primary/20 w-full sm:w-auto font-medium"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">Nenhum registro encontrado para este período</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <div key={record.id} className="p-6 glass-panel border-primary/5 card-hover group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={`${statusColors[record.status]} text-sm px-4 py-1.5 font-bold rounded-full`}>
                                <div className="flex items-center gap-2">
                                  {statusIcons[record.status]}
                                  {statusLabels[record.status]}
                                </div>
                              </Badge>
                              {record.taskSection && (
                                <Badge variant="secondary" className="text-sm px-4 py-1.5 font-bold rounded-full text-secondary">
                                  Tarefa {record.taskSection}
                                </Badge>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-2xl tracking-tight text-foreground/90">{record.workerName}</p>
                              <div className="flex items-center gap-2 mt-1 text-muted-foreground font-semibold">
                                <Calendar className="h-4 w-4" />
                                <p className="text-sm uppercase tracking-wide">
                                  {new Date(record.date).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            {record.notes && (
                              <p className="text-base text-muted-foreground/80 bg-primary/5 p-4 rounded-xl border border-primary/10 italic">
                                "{record.notes}"
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-2">
                              <div className="w-2 h-2 rounded-full bg-primary/40" />
                              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                                Registrado {formatTimeAgo(new Date(record.createdAt))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-panel border-none">
              <CardHeader>
                <CardTitle className="text-xl">Evolução da Presença</CardTitle>
                <CardDescription>Visualize a frequência ao longo do mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-2 border rounded-lg bg-background/50">
                  <Line options={attendanceChartOptions} data={attendanceChartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly attendance statistics and evolution chart */}
          {filteredRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Evolução Mensal de Presença</CardTitle>
                <CardDescription>Análise da frequência nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Sangrias</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredRecords.filter((r) => r.status === "sangria-realizada").length}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Faltas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredRecords.filter((r) => r.status === "falta").length}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Chuva</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {filteredRecords.filter((r) => r.status === "falta-chuva").length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Recuperadas</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {filteredRecords.filter((r) => r.status === "tarefa-recuperada").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inspecoes" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Inspeções Técnicas de Qualidade</CardTitle>
              <CardDescription>Realize inspeções de cada tarefa de cada trabalhador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5 p-5 border rounded-lg bg-muted/30">
                <h3 className="font-semibold text-lg">Nova Inspeção</h3>

                <div className="space-y-2">
                  <Label htmlFor="worker-inspection" className="text-base">
                    1. Selecione o Trabalhador
                  </Label>
                  <Select value={selectedWorkerForInspection} onValueChange={setSelectedWorkerForInspection}>
                    <SelectTrigger id="worker-inspection" className="h-12 text-base">
                      <SelectValue placeholder="Escolha o trabalhador" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id} className="text-base py-3">
                          {worker.workerName} ({worker.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWorkerForInspection && (
                  <div className="space-y-2">
                    <Label htmlFor="task-inspection" className="text-base">
                      2. Selecione a Tarefa
                    </Label>
                    <Select value={selectedTaskForInspection} onValueChange={setSelectedTaskForInspection}>
                      <SelectTrigger id="task-inspection" className="h-12 text-base">
                        <SelectValue
                          placeholder={`Escolha a tarefa (${selectedWorkerForInspectionData?.code}1, ${selectedWorkerForInspectionData?.code}2, ${selectedWorkerForInspectionData?.code}3, ${selectedWorkerForInspectionData?.code}4)`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedWorkerForInspectionData?.sections.map((section) => (
                          <SelectItem key={section.section} value={section.section} className="text-base py-3">
                            Tarefa {section.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Seções do trabalhador:{" "}
                      {selectedWorkerForInspectionData?.sections.map((s) => s.section).join(", ")}
                    </p>
                  </div>
                )}

                {selectedTaskForInspection && (
                  <Button onClick={openInspectionDialog} size="lg" className="w-full text-base h-12">
                    <ClipboardCheck className="h-5 w-5 mr-2" />
                    Realizar Inspeção
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-semibold text-lg">Histórico de Inspeções</h3>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label htmlFor="filter-inspection-month" className="text-base whitespace-nowrap">
                      Mês:
                    </Label>
                    <Input
                      id="filter-inspection-month"
                      type="month"
                      value={inspectionMonth}
                      onChange={(e) => setInspectionMonth(e.target.value)}
                      className="h-12 text-base w-full sm:w-auto"
                    />
                  </div>
                </div>

                {filteredInspections.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">Nenhuma inspeção realizada neste mês</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInspections
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((inspection) => (
                        <div key={inspection.id} className="border rounded-lg p-5 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="font-semibold text-lg break-words">{inspection.notes.split(":")[0]}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(inspection.date).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            {getScoreBadge(inspection.overallScore)}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Ângulo</p>
                              <p className="text-lg font-semibold">{inspection.angle}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Profundidade</p>
                              <p className="text-lg font-semibold">{inspection.depth}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Ferimentos</p>
                              <p className="text-lg font-semibold">{inspection.injuries}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Limpeza</p>
                              <p className="text-lg font-semibold">{inspection.spoutCleanliness}/5</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium">Nota Geral:</span>
                              <span className={`text-3xl font-bold ${getScoreColor(inspection.overallScore)}`}>
                                {inspection.overallScore.toFixed(1)}/5.0
                              </span>
                            </div>
                          </div>

                          {inspection.notes.includes(":") && (
                            <div className="pt-3 border-t">
                              <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                              <p className="text-sm bg-muted/50 p-3 rounded break-words">
                                {inspection.notes.split(":")[1]}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Inspeção Técnica de Qualidade</DialogTitle>
            <DialogDescription>Avalie os critérios de qualidade da sangria (1 = Ruim, 5 = Excelente)</DialogDescription>
          </DialogHeader>
          {selectedWorkerForInspection && selectedTaskForInspection && (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold text-base">
                  {selectedWorkerForInspectionData?.workerName} - Tarefa {selectedTaskForInspection}
                </p>
                <p className="text-sm text-muted-foreground">
                  Inspeção do mês: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Ângulo de Corte</Label>
                    <span className="text-xl font-bold text-primary">{angle[0]}/5</span>
                  </div>
                  <Slider value={angle} onValueChange={setAngle} min={1} max={5} step={1} className="py-2" />
                  <p className="text-sm text-muted-foreground">Avalie o ângulo correto do corte na casca</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Profundidade do Corte</Label>
                    <span className="text-xl font-bold text-primary">{depth[0]}/5</span>
                  </div>
                  <Slider value={depth} onValueChange={setDepth} min={1} max={5} step={1} className="py-2" />
                  <p className="text-sm text-muted-foreground">Profundidade adequada sem danificar o câmbio</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Ausência de Ferimentos</Label>
                    <span className="text-xl font-bold text-primary">{injuries[0]}/5</span>
                  </div>
                  <Slider value={injuries} onValueChange={setInjuries} min={1} max={5} step={1} className="py-2" />
                  <p className="text-sm text-muted-foreground">5 = sem ferimentos, 1 = muitos ferimentos</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Limpeza da Bica</Label>
                    <span className="text-xl font-bold text-primary">{spoutCleanliness[0]}/5</span>
                  </div>
                  <Slider
                    value={spoutCleanliness}
                    onValueChange={setSpoutCleanliness}
                    min={1}
                    max={5}
                    step={1}
                    className="py-2"
                  />
                  <p className="text-sm text-muted-foreground">Estado de limpeza e manutenção da bica</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspectionNotes" className="text-base">
                    Observações
                  </Label>
                  <Textarea
                    id="inspectionNotes"
                    placeholder="Adicione observações sobre a inspeção..."
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    rows={4}
                    className="text-base min-h-[100px]"
                  />
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-base">Nota Geral Prevista:</span>
                    <span className="text-3xl font-bold text-primary">
                      {((angle[0] + depth[0] + injuries[0] + spoutCleanliness[0]) / 4).toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSubmitInspection} className="w-full h-12 text-base" size="lg">
                <ClipboardCheck className="h-5 w-5 mr-2" />
                Registrar Inspeção
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  )
}
