"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getTasks, getInspections, addInspection, updateTask } from "@/lib/storage"
import type { Task, Inspection } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ClipboardCheck, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TechnicalInspection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Inspection form state
  const [angle, setAngle] = useState([3])
  const [depth, setDepth] = useState([3])
  const [injuries, setInjuries] = useState([5])
  const [spoutCleanliness, setSpoutCleanliness] = useState([3])
  const [notes, setNotes] = useState("")

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
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allTasks, allInspections] = await Promise.all([
        getTasks(),
        getInspections()
      ])

      const completedTasks = allTasks.filter((t) => t.status === "completed")
      setTasks(completedTasks)
      setInspections(allInspections)
    } catch (error) {
      console.error("Failed to load inspection data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInspect = (task: Task) => {
    setSelectedTask(task)
    setAngle([3])
    setDepth([3])
    setInjuries([5])
    setSpoutCleanliness([3])
    setNotes("")
    setIsDialogOpen(true)
  }

  const handleSubmitInspection = async () => {
    if (!user || !selectedTask) return

    const overallScore = (angle[0] + depth[0] + injuries[0] + spoutCleanliness[0]) / 4

    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      taskId: selectedTask.id,
      inspectorId: user.id,
      inspectorName: user.name,
      date: new Date().toISOString().split("T")[0],
      angle: angle[0],
      depth: depth[0],
      injuries: injuries[0],
      spoutCleanliness: spoutCleanliness[0],
      overallScore,
      notes,
      createdAt: new Date().toISOString(),
    }

    await addInspection(newInspection)
    await updateTask(selectedTask.id, { status: "inspected", inspectionId: newInspection.id })
    // loadData triggered by event listener in storage.ts
    // manual loadData to be sure of UI update
    loadData()

    setIsDialogOpen(false)
    toast({
      title: "Inspeção registrada",
      description: `Nota geral: ${overallScore.toFixed(1)}/5.0`,
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
        <Badge className="bg-primary text-white font-black uppercase text-[10px] px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Excelente
        </Badge>
      )
    if (score >= 3.5)
      return (
        <Badge className="bg-secondary text-white font-black uppercase text-[10px] px-2 py-0.5">
          <TrendingUp className="h-3 w-3 mr-1" />
          Bom
        </Badge>
      )
    if (score >= 2.5)
      return (
        <Badge className="bg-accent text-white font-black uppercase text-[10px] px-2 py-0.5">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Regular
        </Badge>
      )
    return (
      <Badge variant="destructive" className="font-black uppercase text-[10px] px-2 py-0.5">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Melhorar
      </Badge>
    )
  }

  const getAverageScore = () => {
    if (inspections.length === 0) return 0
    return inspections.reduce((sum, insp) => sum + insp.overallScore, 0) / inspections.length
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const inspection = inspections.find((i) => i.taskId === task.id)

    return (
      <Card className="glass-panel border-none shadow-xl card-hover group overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl font-black text-foreground/90 uppercase tracking-tight">
              Seção {task.taskType}
            </CardTitle>
            {inspection ? getScoreBadge(inspection.overallScore) : <Badge variant="outline" className="font-black uppercase text-[10px] px-2 py-0.5 border-primary/20 text-primary/60">Aguardando</Badge>}
          </div>
          <CardDescription className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">{task.workerName} • {new Date(task.date).toLocaleDateString("pt-BR")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/[0.03] rounded-xl border border-primary/5">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Produção:</span>
            <span className="text-xl font-black text-primary">{task.productionKg} kg</span>
          </div>

          {inspection ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-primary/5">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-1">Ângulo</p>
                  <p className="text-lg font-black text-foreground/80">{inspection.angle}/5</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-primary/5">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-1">Profundidade</p>
                  <p className="text-lg font-black text-foreground/80">{inspection.depth}/5</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-primary/5">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-1">Ferimentos</p>
                  <p className="text-lg font-black text-foreground/80">{inspection.injuries}/5</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-primary/5">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-1">Limpeza</p>
                  <p className="text-lg font-black text-foreground/80">{inspection.spoutCleanliness}/5</p>
                </div>
              </div>
              <div className="pt-4 border-t border-primary/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Nota Geral:</span>
                  <span className={`text-4xl font-black ${getScoreColor(inspection.overallScore)}`}>
                    {inspection.overallScore.toFixed(1)}
                  </span>
                </div>
              </div>
              {inspection.notes && (
                <div className="bg-primary/[0.03] p-4 rounded-xl border border-primary/5 font-medium leading-relaxed italic text-foreground/80 text-sm">
                  "{inspection.notes}"
                </div>
              )}
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Fiscal: {inspection.inspectorName}</p>
            </div>
          ) : (
            <Button onClick={() => handleInspect(task)} className="w-full h-12 premium-gradient shadow-md font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all">
              <ClipboardCheck className="h-5 w-5 mr-3" />
              Realizar Inspeção
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-5xl font-black text-gradient tracking-tighter uppercase">Fiscalização Técnica</h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 font-medium mt-1">Controle de qualidade e performance da sangria</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="glass-panel border-none shadow-xl border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60">Total de Inspeções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">{loading ? "..." : inspections.length}</div>
            <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">registros realizados</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-xl border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-secondary/60">Nota Média Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black ${getScoreColor(getAverageScore())}`}>
              {loading ? "..." : getAverageScore().toFixed(1)}<span className="text-base text-muted-foreground/40 font-black ml-1">/ 5.0</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">desempenho técnico</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-xl border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-accent/60">Aguardando Inspeção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-accent">
              {loading ? "..." : tasks.filter((t) => !inspections.find((i) => i.taskId === t.id)).length}
            </div>
            <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">tarefas pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 h-auto p-2 glass-panel border-none">
          <TabsTrigger value="pending" className="py-4 font-black uppercase tracking-widest text-xs data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">
            Aguardando Inspeção
          </TabsTrigger>
          <TabsTrigger value="inspected" className="py-4 font-black uppercase tracking-widest text-xs data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">
            Inspecionadas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando dados...</div>
          ) : tasks.filter((t) => !inspections.find((i) => i.taskId === t.id)).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma tarefa aguardando inspeção
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks
                .filter((t) => !inspections.find((i) => i.taskId === t.id))
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="inspected" className="space-y-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando dados...</div>
          ) : tasks.filter((t) => inspections.find((i) => i.taskId === t.id)).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma tarefa inspecionada ainda
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks
                .filter((t) => inspections.find((i) => i.taskId === t.id))
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Inspection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inspeção Técnica</DialogTitle>
            <DialogDescription>Avalie os critérios de qualidade da sangria (1 = Ruim, 5 = Excelente)</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">
                  Tarefa {selectedTask.taskType} - {selectedTask.workerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedTask.date).toLocaleDateString("pt-BR")} - {selectedTask.productionKg}kg
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Ângulo de Corte</Label>
                    <span className="text-lg font-bold text-primary">{angle[0]}/5</span>
                  </div>
                  <Slider value={angle} onValueChange={setAngle} min={1} max={5} step={1} />
                  <p className="text-xs text-muted-foreground">Avalie o ângulo correto do corte na casca</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Profundidade do Corte</Label>
                    <span className="text-lg font-bold text-primary">{depth[0]}/5</span>
                  </div>
                  <Slider value={depth} onValueChange={setDepth} min={1} max={5} step={1} />
                  <p className="text-xs text-muted-foreground">Profundidade adequada sem danificar o câmbio</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Ausência de Ferimentos</Label>
                    <span className="text-lg font-bold text-primary">{injuries[0]}/5</span>
                  </div>
                  <Slider value={injuries} onValueChange={setInjuries} min={1} max={5} step={1} />
                  <p className="text-xs text-muted-foreground">5 = sem ferimentos, 1 = muitos ferimentos</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Limpeza da Bica</Label>
                    <span className="text-lg font-bold text-primary">{spoutCleanliness[0]}/5</span>
                  </div>
                  <Slider value={spoutCleanliness} onValueChange={setSpoutCleanliness} min={1} max={5} step={1} />
                  <p className="text-xs text-muted-foreground">Estado de limpeza e manutenção da bica</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicione observações sobre a inspeção..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Nota Geral Prevista:</span>
                    <span className="text-3xl font-bold text-primary">
                      {((angle[0] + depth[0] + injuries[0] + spoutCleanliness[0]) / 4).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSubmitInspection} className="w-full" size="lg">
                Registrar Inspeção
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
