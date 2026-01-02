"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getTasks, addTask, updateTask, canTapSection } from "@/lib/storage"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TaskManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [taskSection, setTaskSection] = useState("")
  // canTapSection is now async, so return type is Promise<{...}>
  // We need to store the resolved values
  const [sectionAvailability, setSectionAvailability] = useState<Record<string, { canTap: boolean; nextAvailableDate?: string; daysRemaining?: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()

    const handleDataUpdate = () => {
      loadTasks()
    }

    window.addEventListener("dataUpdated", handleDataUpdate)
    return () => window.removeEventListener("dataUpdated", handleDataUpdate)
  }, [user])

  useEffect(() => {
    if (user && tasks.length > 0) { // Check availability when tasks change or user loads
      checkAvailability()
    }
  }, [tasks, user])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const allTasks = await getTasks()
      if (user?.role === "worker") {
        setTasks(allTasks.filter((t) => t.workerId === user.id))
      } else {
        setTasks(allTasks)
      }
    } catch (error) {
      console.error("Failed to load tasks", error)
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async () => {
    if (!user) return
    const availability: Record<string, { canTap: boolean; nextAvailableDate?: string; daysRemaining?: number }> = {}
    const sections = getWorkerSections()

    // Execute in parallel
    await Promise.all(sections.map(async (section) => {
      availability[section] = await canTapSection(section, user.id)
    }))

    setSectionAvailability(availability)
  }

  const handleCreateTask = async () => {
    if (!user || !taskSection) return

    const availability = await canTapSection(taskSection, user.id)
    if (!availability.canTap) {
      toast({
        title: "Seção não disponível",
        description: `A seção ${taskSection} só poderá ser sangrada novamente em ${availability.nextAvailableDate} (faltam ${availability.daysRemaining} dias)`,
        variant: "destructive",
      })
      return
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      workerId: user.id,
      workerName: user.name,
      date: new Date().toISOString().split("T")[0],
      taskType: taskSection as any,
      status: "pending",
      productionKg: 0,
      createdAt: new Date().toISOString(),
    }

    await addTask(newTask)
    loadTasks()
    setIsDialogOpen(false)
    toast({
      title: "Tarefa criada",
      description: `Tarefa ${taskSection} criada com sucesso`,
    })
  }

  const handleStartTask = async (taskId: string) => {
    await updateTask(taskId, { status: "in-progress" })
    loadTasks()
    toast({
      title: "Tarefa iniciada",
      description: "Boa sorte com a sangria!",
    })
  }

  const handleCompleteTask = async (taskId: string) => {
    await updateTask(taskId, {
      status: "completed",
      completedAt: new Date().toISOString(),
      lastTappingDate: new Date().toISOString().split("T")[0],
    })
    loadTasks()
    toast({
      title: "Tarefa concluída",
      description: "Tarefa finalizada com sucesso. Próxima sangria em 4 dias.",
    })
  }

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1 font-black uppercase text-[10px] px-2 py-0.5 border-primary/20 text-primary">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="gap-1 bg-secondary text-white font-black uppercase text-[10px] px-2 py-0.5">
            <AlertCircle className="h-3 w-3" />
            Em Andamento
          </Badge>
        )
      case "completed":
        return (
          <Badge className="gap-1 bg-primary text-white font-black uppercase text-[10px] px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            Concluída
          </Badge>
        )
      case "inspected":
        return (
          <Badge className="gap-1 bg-accent text-white font-black uppercase text-[10px] px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            Inspecionada
          </Badge>
        )
    }
  }

  const filterTasksBySection = (section: string) => {
    return tasks.filter((t) => t.taskType === section)
  }

  const TaskCard = ({ task }: { task: Task }) => {
    // We rely on sectionAvailability state for pre-computed status to avoid async inside render
    // If not found, default to available
    const availability = (user && sectionAvailability[task.taskType]) || { canTap: true }

    return (
      <Card className="glass-panel border-none shadow-xl card-hover group overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black text-sm border border-primary/10 uppercase tracking-wider">
              {task.taskType}
            </div>
            {getStatusBadge(task.status)}
          </div>
          <CardTitle className="text-xl font-black text-foreground/90 uppercase tracking-tight">
            Seção {task.taskType}
          </CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
            {task.workerName} • {new Date(task.date).toLocaleDateString("pt-BR")}
          </CardDescription>
          {task.lastTappingDate && (
            <div className="mt-4 pt-4 border-t border-primary/5 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em]">
                <Calendar className="h-3 w-3" />
                <span>Última sangria: {new Date(task.lastTappingDate).toLocaleDateString("pt-BR")}</span>
              </div>
              {!availability.canTap && availability.nextAvailableDate && (
                <div className="text-[10px] font-black uppercase text-amber-600 tracking-[0.2em] bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Próxima: {new Date(availability.nextAvailableDate).toLocaleDateString("pt-BR")} ({availability.daysRemaining}d)
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-2">
          {user?.role === "worker" && task.status === "pending" && (
            <Button onClick={() => handleStartTask(task.id)} className="w-full h-12 premium-gradient shadow-md font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all">
              Iniciar Tarefa
            </Button>
          )}

          {user?.role === "worker" && task.status === "in-progress" && (
            <Button onClick={() => handleCompleteTask(task.id)} className="w-full h-12 bg-secondary text-white font-black uppercase tracking-wider hover:bg-secondary/90 transition-all">
              Concluir Tarefa
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const getWorkerSections = () => {
    if (!user) return []

    const sectionMap: Record<string, string[]> = {
      aquiles: ["A1", "A2", "A3", "A4"],
      messias: ["B1", "B2", "B3", "B4"],
      zuzueli: ["C1", "C2", "C3", "C4"],
      anderson: ["D1", "D2", "D3", "D4"],
      patrick: ["E1", "E2", "E3", "E4"],
      valdeci: ["F1", "F2", "F3", "F4"],
      fabio: ["G1", "G2", "G3", "G4"],
    }

    return sectionMap[user.name.toLowerCase()] || []
  }

  const workerSections = getWorkerSections()

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-5xl font-black text-gradient tracking-tighter uppercase italic">Sistema D4</h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 font-medium mt-1">Gerenciamento inteligente de sangria com ciclo de recuperação</p>
        </div>
        {user?.role === "worker" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="premium-gradient shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-8 font-black uppercase tracking-wider h-14 w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>Selecione a seção para criar uma tarefa (Sistema D4 - 4 dias entre sangrias)</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-section">Seção</Label>
                  <Select value={taskSection} onValueChange={setTaskSection}>
                    <SelectTrigger id="task-section">
                      <SelectValue placeholder="Selecione a seção" />
                    </SelectTrigger>
                    <SelectContent>
                      {workerSections.map((section) => {
                        const availability = sectionAvailability[section]
                        const isAvailable = availability?.canTap !== false
                        return (
                          <SelectItem
                            key={section}
                            value={section}
                            disabled={!isAvailable}
                          >
                            {section} {!isAvailable && `(disponível em ${availability.daysRemaining} dias)`}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {taskSection && sectionAvailability[taskSection] && !sectionAvailability[taskSection].canTap && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Esta seção foi sangrada recentemente. Próxima sangria disponível em {sectionAvailability[taskSection].nextAvailableDate} (faltam {sectionAvailability[taskSection].daysRemaining} dias).
                    </AlertDescription>
                  </Alert>
                )}
                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Sistema D4 - Suas Seções:</p>
                  {workerSections.map((section) => {
                    const availability = sectionAvailability[section]
                    return (
                      <div key={section} className="flex items-center justify-between">
                        <span><strong>{section}:</strong> Gerenciamento de sangria</span>
                        {availability && !availability.canTap && (
                          <Badge variant="outline" className="text-xs">
                            {availability.daysRemaining}d restantes
                          </Badge>
                        )}
                        {availability && availability.canTap && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Disponível
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <Button onClick={handleCreateTask} className="w-full" disabled={!taskSection}>
                Criar Tarefa
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema D4:</strong> Cada seção só pode ser sangrada novamente após 4 dias da última sangria, garantindo a recuperação adequada das árvores.
        </AlertDescription>
      </Alert>

      {user?.role === "worker" ? (
        <Tabs defaultValue={workerSections[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-2 glass-panel border-none">
            {workerSections.map((section) => (
              <TabsTrigger key={section} value={section} className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">
                {section}
              </TabsTrigger>
            ))}
          </TabsList>
          {workerSections.map((section) => (
            <TabsContent key={section} value={section} className="space-y-4">
              {filterTasksBySection(section).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhuma tarefa {section} encontrada
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filterTasksBySection(section).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Tabs defaultValue="A" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 gap-2 h-auto p-2 glass-panel border-none">
            <TabsTrigger value="A" className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">Aquiles</TabsTrigger>
            <TabsTrigger value="B" className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">Messias</TabsTrigger>
            <TabsTrigger value="C" className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">Zuzueli</TabsTrigger>
            <TabsTrigger value="D" className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">Anderson</TabsTrigger>
            <TabsTrigger value="E" className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">Patrick</TabsTrigger>
            <TabsTrigger value="F" className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">Valdeci</TabsTrigger>
            <TabsTrigger value="G" className="py-4 font-black uppercase tracking-widest text-[10px] data-[state=active]:premium-gradient data-[state=active]:text-white transition-all rounded-xl border-none">Fabio</TabsTrigger>
          </TabsList>
          {["A", "B", "C", "D", "E", "F", "G"].map((code) => (
            <TabsContent key={code} value={code} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((num) => {
                  const section = `${code}${num}`
                  const sectionTasks = filterTasksBySection(section)
                  return (
                    <div key={section}>
                      <h3 className="font-semibold mb-3">Seção {section}</h3>
                      {sectionTasks.length === 0 ? (
                        <Card>
                          <CardContent className="py-6 text-center text-sm text-muted-foreground">
                            Sem tarefas
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {sectionTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
