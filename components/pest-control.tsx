"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  getPestControlRecords,
  addPestControlRecord,
  updatePestControlRecord,
  deletePestControlRecord,
  getPestControlAreaMaps,
  addPestControlAreaMap,
  updatePestControlAreaMap,
  deletePestControlAreaMap,
  getPestInspectionSchedules,
  addPestInspectionSchedule,
  updatePestInspectionSchedule,
  deletePestInspectionSchedule,
  getPestInspectionChecklists,
  addPestInspectionChecklist,
  updatePestInspectionChecklist,
  deletePestInspectionChecklist,
  getPestControlTrainings,
  addPestControlTraining,
  deletePestControlTraining,
  getUsers,
} from "@/lib/storage"
import { getWorkerInventory } from "@/lib/tree-data"
import type {
  PestControlRecord,
  PestControlAreaMap,
  PestInspectionSchedule,
  PestInspectionChecklist,
  PestControlTraining,
} from "@/lib/types"
import { Plus, Bug, AlertTriangle, Eye, Trash2, Edit, Map, Calendar, ClipboardCheck, GraduationCap, BarChart3, Download, Camera, Upload, X } from 'lucide-react'

export function PestControl() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("registros")
  const [records, setRecords] = useState<PestControlRecord[]>([])
  const [areaMaps, setAreaMaps] = useState<PestControlAreaMap[]>([])
  const [inspectionSchedules, setInspectionSchedules] = useState<PestInspectionSchedule[]>([])
  const [inspectionChecklists, setInspectionChecklists] = useState<PestInspectionChecklist[]>([])
  const [trainings, setTrainings] = useState<PestControlTraining[]>([])
  const [allWorkers, setAllWorkers] = useState<{ id: string; name: string }[]>([]) // Added for training participants
  const [isAddingRecord, setIsAddingRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PestControlRecord | null>(null) // Changed from string to PestControlRecord | null
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")

  const [isAddingAreaMap, setIsAddingAreaMap] = useState(false)
  const [editingAreaMap, setEditingAreaMap] = useState<PestControlAreaMap | null>(null) // Changed from string to PestControlAreaMap | null

  const [isAddingSchedule, setIsAddingSchedule] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<PestInspectionSchedule | null>(null) // Added editing state for schedules
  const [isAddingChecklist, setIsAddingChecklist] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<PestInspectionSchedule | null>(null) // Changed from string to PestInspectionSchedule | null
  const [isAddingTraining, setIsAddingTraining] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [checklistPhotoFile, setChecklistPhotoFile] = useState<File | null>(null)
  const [checklistPhotoPreview, setChecklistPhotoPreview] = useState<string>("")

  const [recordForm, setRecordForm] = useState({
    taskSection: "",
    pestType: "fungos" as PestControlRecord["pestType"],
    pestSpecies: "",
    controlMethod: "",
    controlType: "integrado" as PestControlRecord["controlType"],
    productUsed: "",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "pendente" as PestControlRecord["status"],
    severity: "media" as PestControlRecord["severity"],
    affectedArea: "",
    affectedTreesCount: "",
    affectedHectares: "",
    dosageUsed: "",
    epiUsed: true,
    notes: "",
  })

  const [areaMapForm, setAreaMapForm] = useState({
    taskSection: "",
    plantAge: "",
    totalTrees: "",
    hectares: "",
    soilType: "",
    irrigationType: "",
    notes: "",
  })

  const [scheduleForm, setScheduleForm] = useState({
    taskSection: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    frequency: "mensal" as const,
  })

  const [checklistForm, setChecklistForm] = useState({
    taskSection: "",
    inspectionDate: new Date().toISOString().split("T")[0],
    pestPresence: false,
    pestSeverity: undefined as ("baixa" | "media" | "alta") | undefined,
    controlEffectiveness: "boa" as const,
    epiCompliance: true,
    productApplication: false,
    applicationRecord: false,
    treatmentArea: "",
    productUsed: "",
    dosage: "",
    observations: "",
  })

  const [trainingForm, setTrainingForm] = useState({
    trainingDate: new Date().toISOString().split("T")[0],
    trainingTopic: "",
    trainer: "",
    duration: "",
    topics: "",
    certificate: false,
    notes: "",
  })

  const isAdmin = user?.role === "admin"
  const isInspector = user?.role === "inspector"
  const canManage = isAdmin || isInspector

  const [users, setUsers] = useState<any[]>([]) // Add state for users

  // ... (existing state)

  const loadRecords = async () => setRecords(await getPestControlRecords())
  const loadAreaMaps = async () => setAreaMaps(await getPestControlAreaMaps())
  const loadSchedules = async () => setInspectionSchedules(await getPestInspectionSchedules())
  const loadChecklists = async () => setInspectionChecklists(await getPestInspectionChecklists())
  const loadTrainings = async () => setTrainings(await getPestControlTrainings())

  const loadAllData = () => {
    loadRecords()
    loadAreaMaps()
    loadSchedules()
    loadChecklists()
    loadTrainings()
  }

  useEffect(() => {
    loadAllData()
    // Fetch users async
    getUsers().then(fetchedUsers => {
      setUsers(fetchedUsers)
      setAllWorkers(fetchedUsers.map((u) => ({ id: u.id, name: u.name })))
    })
  }, [])

  const workerInventory = getWorkerInventory()
  const allSections = workerInventory.flatMap((w) =>
    w.sections.map((s) => ({ section: s.section, worker: w.workerName, workerId: w.id })),
  )
  // Remove sync call: const users = getUsers() 
  const workers = users.filter((u) => u.role === "worker")

  // Record Management
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const selectedSection = allSections.find((s) => s.section === recordForm.taskSection)
    if (!selectedSection) return

    let photoUrl = editingRecord?.photoUrl || ""
    if (photoFile) {
      photoUrl = photoPreview
    }

    const recordData: Omit<PestControlRecord, "id" | "createdAt"> = {
      taskSection: recordForm.taskSection,
      workerName: selectedSection.worker,
      workerId: selectedSection.workerId,
      pestType: recordForm.pestType,
      pestSpecies: recordForm.pestSpecies,
      controlMethod: recordForm.controlMethod,
      controlType: recordForm.controlType,
      productUsed: recordForm.productUsed,
      applicationDate: recordForm.applicationDate,
      status: recordForm.status,
      severity: recordForm.severity,
      affectedArea: recordForm.affectedArea,
      affectedTreesCount: recordForm.affectedTreesCount ? Number.parseInt(recordForm.affectedTreesCount) : undefined,
      affectedHectares: recordForm.affectedHectares ? Number.parseFloat(recordForm.affectedHectares) : undefined,
      dosageUsed: recordForm.dosageUsed || undefined,
      epiUsed: recordForm.epiUsed,
      notes: recordForm.notes || undefined,
      registeredBy: user.id,
      registeredByName: user.name,
      resolvedAt:
        recordForm.status === "controlado" && !editingRecord?.resolvedAt
          ? new Date().toISOString()
          : editingRecord?.resolvedAt,
      photoUrl: photoUrl || undefined,
    }

    if (editingRecord) {
      await updatePestControlRecord(editingRecord.id, recordData)
    } else {
      await addPestControlRecord({
        ...recordData,
        id: `pest-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as PestControlRecord)
    }

    loadRecords()
    resetRecordForm()
  }

  const handleEditRecord = (record: PestControlRecord) => {
    setRecordForm({
      taskSection: record.taskSection,
      pestType: record.pestType,
      pestSpecies: record.pestSpecies || "",
      controlMethod: record.controlMethod,
      controlType: record.controlType,
      productUsed: record.productUsed,
      applicationDate: record.applicationDate,
      status: record.status,
      severity: record.severity,
      affectedArea: record.affectedArea,
      affectedTreesCount: record.affectedTreesCount?.toString() || "",
      affectedHectares: record.affectedHectares?.toString() || "",
      dosageUsed: record.dosageUsed || "",
      epiUsed: record.epiUsed ?? true,
      notes: record.notes || "",
    })
    setEditingRecord(record)
    setIsAddingRecord(true)
    if (record.photoUrl) {
      setPhotoPreview(record.photoUrl)
    }
  }

  const handleDeleteRecord = (recordId: string) => {
    if (confirm("Deseja realmente excluir este registro?")) {
      deletePestControlRecord(recordId)
      loadRecords()
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview("")
    if (editingRecord) {
      updatePestControlRecord(editingRecord.id, { photoUrl: undefined }) // Remove photo from record
      setEditingRecord({ ...editingRecord, photoUrl: undefined })
    }
  }

  const resetRecordForm = () => {
    setRecordForm({
      taskSection: "",
      pestType: "fungos",
      pestSpecies: "",
      controlMethod: "",
      controlType: "integrado",
      productUsed: "",
      applicationDate: new Date().toISOString().split("T")[0],
      status: "pendente",
      severity: "media",
      affectedArea: "",
      affectedTreesCount: "",
      affectedHectares: "",
      dosageUsed: "",
      epiUsed: true,
      notes: "",
    })
    setEditingRecord(null)
    setIsAddingRecord(false)
    setPhotoFile(null)
    setPhotoPreview("")
  }

  // Area Map Management
  const handleAreaMapSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const sectionData = allSections.find((s) => s.section === areaMapForm.taskSection)
    if (!sectionData) return

    if (editingAreaMap) {
      updatePestControlAreaMap(editingAreaMap.id, {
        // Use editingAreaMap.id
        ...areaMapForm,
        plantAge: Number(areaMapForm.plantAge),
        totalTrees: Number(areaMapForm.totalTrees),
        hectares: Number(areaMapForm.hectares),
        workerName: sectionData.worker,
        workerId: sectionData.workerId,
      })
      setEditingAreaMap(null)
    } else {
      const newMap: PestControlAreaMap = {
        id: `area-${Date.now()}`,
        ...areaMapForm,
        plantAge: Number(areaMapForm.plantAge),
        totalTrees: Number(areaMapForm.totalTrees),
        hectares: Number(areaMapForm.hectares),
        workerName: sectionData.worker,
        workerId: sectionData.workerId,
        pestHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addPestControlAreaMap(newMap)
    }

    resetAreaMapForm()
    loadAllData()
  }

  const resetAreaMapForm = () => {
    setAreaMapForm({
      taskSection: "",
      plantAge: "",
      totalTrees: "",
      hectares: "",
      soilType: "",
      irrigationType: "",
      notes: "",
    })
    setIsAddingAreaMap(false)
    setEditingAreaMap(null)
  }

  // Inspection Schedule Management
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const sectionData = allSections.find((s) => s.section === scheduleForm.taskSection)
    if (!sectionData) return

    const newSchedule: PestInspectionSchedule = {
      id: `schedule-${Date.now()}`,
      ...scheduleForm,
      workerName: sectionData.worker,
      workerId: sectionData.workerId,
      inspectorId: user?.id || "",
      inspectorName: user?.name || "",
      status: "agendada",
      createdAt: new Date().toISOString(),
    }
    addPestInspectionSchedule(newSchedule)

    resetScheduleForm()
    loadAllData()
  }

  const resetScheduleForm = () => {
    setScheduleForm({
      taskSection: "",
      scheduledDate: new Date().toISOString().split("T")[0],
      frequency: "mensal",
    })
    setIsAddingSchedule(false)
    setEditingSchedule(null)
  }

  // Inspection Checklist Management
  const handleChecklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedSchedule) return

    let photoUrl = ""
    if (checklistPhotoFile) {
      photoUrl = checklistPhotoPreview
    }

    const checklistData: Omit<PestInspectionChecklist, "id" | "createdAt"> = {
      // taskSection: checklistForm.taskSection, // Taken from selectedSchedule
      inspectionScheduleId: selectedSchedule.id,
      taskSection: selectedSchedule.taskSection,
      inspectionDate: new Date().toISOString().split("T")[0],
      inspectorId: user.id,
      inspectorName: user.name,
      pestPresence: checklistForm.pestPresence,
      pestSeverity: checklistForm.pestSeverity,
      controlEffectiveness: checklistForm.controlEffectiveness,
      epiCompliance: checklistForm.epiCompliance,
      productApplication: checklistForm.productApplication,
      applicationRecord: checklistForm.applicationRecord,
      treatmentArea: checklistForm.treatmentArea || undefined,
      productUsed: checklistForm.productUsed || undefined,
      dosage: checklistForm.dosage || undefined,
      observations: checklistForm.observations,
      photoUrl: photoUrl || undefined,
    }

    await addPestControlRecord({
      ...checklistData,
      id: `check-${Date.now()}`,
      createdAt: new Date().toISOString()
    } as any) // Workaround for specific checklist storage mismatch if any
    await updatePestInspectionSchedule(selectedSchedule.id, {
      status: "realizada",
      completedDate: new Date().toISOString(),
      findings: checklistForm.observations,
    })

    loadSchedules()
    loadChecklists()
    resetChecklistForm()
  }

  const resetChecklistForm = () => {
    setChecklistForm({
      taskSection: "",
      inspectionDate: new Date().toISOString().split("T")[0],
      pestPresence: false,
      pestSeverity: undefined,
      controlEffectiveness: "boa",
      epiCompliance: true,
      productApplication: false,
      applicationRecord: false,
      treatmentArea: "",
      productUsed: "",
      dosage: "",
      observations: "",
    })
    setSelectedSchedule(null)
    setIsAddingChecklist(false)
    setChecklistPhotoFile(null)
    setChecklistPhotoPreview("")
  }

  // Added function to handle checklist photo file selection
  const handleChecklistPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setChecklistPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setChecklistPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChecklistPhotoRemove = () => {
    setChecklistPhotoFile(null)
    setChecklistPhotoPreview("")
    if (
      selectedSchedule &&
      inspectionChecklists.find((c) => c.inspectionScheduleId === selectedSchedule.id)?.photoUrl
    ) {
      const checklistToUpdate = inspectionChecklists.find((c) => c.inspectionScheduleId === selectedSchedule.id)
      if (checklistToUpdate) {
        updatePestInspectionChecklist(checklistToUpdate.id, { photoUrl: undefined }) // Remove photo from checklist
      }
    }
  }

  // Training Management
  const handleTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const participantNames = selectedParticipants
      .map((id) => allWorkers.find((w) => w.id === id)?.name || "") // Use allWorkers
      .filter(Boolean)

    const newTraining: PestControlTraining = {
      id: `training-${Date.now()}`,
      ...trainingForm,
      duration: Number(trainingForm.duration),
      topics: trainingForm.topics.split(",").map((t) => t.trim()),
      participants: selectedParticipants,
      participantNames,
      registeredBy: user?.id || "",
      registeredByName: user?.name || "",
      createdAt: new Date().toISOString(),
    }
    addPestControlTraining(newTraining)

    resetTrainingForm()
    loadAllData()
  }

  const resetTrainingForm = () => {
    setTrainingForm({
      trainingDate: new Date().toISOString().split("T")[0],
      trainingTopic: "",
      trainer: "",
      duration: "",
      topics: "",
      certificate: false,
      notes: "",
    })
    setSelectedParticipants([])
    setIsAddingTraining(false)
  }

  const filteredRecords = records.filter((record) => {
    if (filterStatus !== "all" && record.status !== filterStatus) return false
    if (filterSeverity !== "all" && record.severity !== filterSeverity) return false
    return true
  })

  const getStatusBadge = (status: PestControlRecord["status"]) => {
    const variants: Record<PestControlRecord["status"], { variant: any; label: string }> = {
      pendente: { variant: "secondary" as const, label: "Pendente" },
      "em-tratamento": { variant: "default" as const, label: "Em Tratamento" },
      controlado: { variant: "secondary" as const, label: "Controlado" },
      monitoramento: { variant: "outline" as const, label: "Monitoramento" },
    }
    return variants[status]
  }

  const getSeverityBadge = (severity: PestControlRecord["severity"]) => {
    const variants: Record<PestControlRecord["severity"], { variant: any; label: string; icon: any }> = {
      baixa: { variant: "outline", label: "Baixa", icon: Eye },
      media: { variant: "default", label: "Média", icon: AlertTriangle },
      alta: { variant: "destructive", label: "Alta", icon: AlertTriangle },
    }
    return variants[severity]
  }

  const getPestTypeLabel = (type: PestControlRecord["pestType"]) => {
    const labels: Record<PestControlRecord["pestType"], string> = {
      formigas: "Formigas",
      fungos: "Fungos",
      insetos: "Insetos",
      doencas: "Doenças",
      "ervas-daninhas": "Ervas Daninhas",
      outro: "Outro",
    }
    return labels[type]
  }

  const getControlTypeLabel = (type: PestControlRecord["controlType"]) => {
    const labels: Record<PestControlRecord["controlType"], string> = {
      cultural: "Cultural",
      biologico: "Biológico",
      quimico: "Químico",
      integrado: "Integrado",
    }
    return labels[type]
  }

  const stats = {
    total: records.length,
    pendente: records.filter((r) => r.status === "pendente").length,
    emTratamento: records.filter((r) => r.status === "em-tratamento").length,
    controlado: records.filter((r) => r.status === "controlado").length,
    alta: records.filter((r) => r.severity === "alta").length,
    areaMapped: areaMaps.length,
    scheduledInspections: inspectionSchedules.filter((s) => s.status === "agendada").length,
    completedInspections: inspectionChecklists.length,
    trainings: trainings.length,
  }

  const generateReport = () => {
    const report = `RELATÓRIO DE CONTROLE DE PRAGAS - SERINGAL
Gerado em: ${new Date().toLocaleString("pt-BR")}

=== RESUMO GERAL ===
Total de Registros: ${stats.total}
Pendentes: ${stats.pendente}
Em Tratamento: ${stats.emTratamento}
Controlados: ${stats.controlado}
Alta Severidade: ${stats.alta}
Áreas Mapeadas: ${stats.areaMapped}
Inspeções Agendadas: ${stats.scheduledInspections}
Inspeções Realizadas: ${stats.completedInspections}
Treinamentos: ${stats.trainings}

=== REGISTROS DE PRAGAS ===
${records
        .map(
          (r, i) => `
${i + 1}. ${getPestTypeLabel(r.pestType)} - Seção ${r.taskSection} (${r.workerName})
   Espécie: ${r.pestSpecies || "N/A"}
   Severidade: ${getSeverityBadge(r.severity).label}
   Status: ${getStatusBadge(r.status).label}
   Tipo de Controle: ${getControlTypeLabel(r.controlType)}
   Método: ${r.controlMethod}
   Produto: ${r.productUsed}
   Dosagem: ${r.dosageUsed || "N/A"}
   Área Afetada: ${r.affectedArea}
   Árvores: ${r.affectedTreesCount || "N/A"} | Hectares: ${r.affectedHectares || "N/A"}
   Data: ${new Date(r.applicationDate).toLocaleDateString("pt-BR")}
   EPI Usado: ${r.epiUsed ? "Sim" : "Não"}
   Obs: ${r.notes || "Nenhuma"}
`,
        )
        .join("\n")}

=== MAPEAMENTO DE ÁREAS ===
${areaMaps
        .map(
          (a, i) => `
${i + 1}. Seção ${a.taskSection} - ${a.workerName}
   Idade: ${a.plantAge} anos
   Árvores: ${a.totalTrees}
   Hectares: ${a.hectares}
   Tipo de Solo: ${a.soilType || "N/A"}
   Irrigação: ${a.irrigationType || "N/A"}
   Última Inspeção: ${a.lastInspectionDate ? new Date(a.lastInspectionDate).toLocaleDateString("pt-BR") : "N/A"}
`,
        )
        .join("\n")}

=== INSPEÇÕES REALIZADAS ===
${inspectionChecklists
        .map(
          (c, i) => `
${i + 1}. Seção ${c.taskSection} - ${new Date(c.inspectionDate).toLocaleDateString("pt-BR")}
   Inspetor: ${c.inspectorName}
   Presença de Praga: ${c.pestPresence ? "Sim" : "Não"}
   ${c.pestPresence ? `Severidade: ${c.pestSeverity}` : ""}
   Eficácia do Controle: ${c.controlEffectiveness}
   Conformidade EPI: ${c.epiCompliance ? "Sim" : "Não"}
   Aplicação de Produto: ${c.productApplication ? "Sim" : "Não"}
   ${c.productApplication ? `Produto: ${c.productUsed} | Dosagem: ${c.dosage}` : ""}
   Observações: ${c.observations}
`,
        )
        .join("\n")}

=== TREINAMENTOS ===
${trainings
        .map(
          (t, i) => `
${i + 1}. ${t.trainingTopic} - ${new Date(t.trainingDate).toLocaleDateString("pt-BR")}
   Instrutor: ${t.trainer}
   Duração: ${t.duration}h
   Participantes: ${t.participantNames.join(", ")}
   Tópicos: ${t.topics.join(", ")}
   Certificado: ${t.certificate ? "Sim" : "Não"}
`,
        )
        .join("\n")}
`

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-controle-pragas-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Controle de Pragas</h2>
          <p className="text-muted-foreground">Sistema de fiscalização e gerenciamento de pragas</p>
        </div>
        <Button onClick={generateReport} variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Baixar Relatório Completo
        </Button>
      </div>


      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Registros", value: stats.total, color: "text-foreground" },
          { label: "Pendentes", value: stats.pendente, color: "text-yellow-600", border: "border-l-yellow-500" },
          { label: "Em Tratamento", value: stats.emTratamento, color: "text-blue-600", border: "border-l-blue-500" },
          { label: "Controlados", value: stats.controlado, color: "text-green-600", border: "border-l-green-500" },
          { label: "Severidade Alta", value: stats.alta, color: "text-red-600", border: "border-l-red-500" },
          { label: "Mapeamento", value: stats.areaMapped, color: "text-primary", border: "border-l-primary" },
          { label: "Inspeções", value: stats.completedInspections, color: "text-secondary", border: "border-l-secondary" },
          { label: "Treinos", value: stats.trainings, color: "text-accent", border: "border-l-accent" },
        ].map((stat, i) => (
          <Card key={i} className={stat.border ? `border-l-4 ${stat.border}` : ""}>
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 md:grid-cols-6 gap-2 h-auto p-1 bg-muted">
          <TabsTrigger value="registros" className="flex-col md:flex-row gap-2 py-2">
            <Bug className="h-4 w-4" />
            <span className="hidden sm:inline">Registros</span>
            <span className="sm:hidden">Reg.</span>
          </TabsTrigger>
          <TabsTrigger value="mapeamento" className="flex-col md:flex-row gap-2 py-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Mapeamento</span>
            <span className="sm:hidden">Mapa</span>
          </TabsTrigger>
          <TabsTrigger value="cronograma" className="flex-col md:flex-row gap-2 py-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Cronograma</span>
            <span className="sm:hidden">Crono</span>
          </TabsTrigger>
          <TabsTrigger value="fiscalizacao" className="flex-col md:flex-row gap-2 py-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Fiscalização</span>
            <span className="sm:hidden">Fiscal</span>
          </TabsTrigger>
          <TabsTrigger value="treinamento" className="flex-col md:flex-row gap-2 py-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Treinamento</span>
            <span className="sm:hidden">Trein.</span>
          </TabsTrigger>
          <TabsTrigger value="metricas" className="flex-col md:flex-row gap-2 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
            <span className="sm:hidden">Métr.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="space-y-4">
          <Button onClick={() => setIsAddingRecord(!isAddingRecord)} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAddingRecord ? "Cancelar" : "Novo Registro"}
          </Button>

          {isAddingRecord && (
            <Card>
              <CardHeader>
                <CardTitle>{editingRecord ? "Editar Registro" : "Novo Registro de Praga"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecordSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="taskSection">Seção/Talhão *</Label>
                      <Select
                        value={recordForm.taskSection}
                        onValueChange={(value) => setRecordForm({ ...recordForm, taskSection: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a seção" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSections.map((item) => (
                            <SelectItem key={item.section} value={item.section}>
                              {item.section} - {item.worker}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pestType">Tipo de Praga *</Label>
                      <Select
                        value={recordForm.pestType}
                        onValueChange={(value: any) => setRecordForm({ ...recordForm, pestType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fungos">Fungos (ex: Microcyclus ulei)</SelectItem>
                          <SelectItem value="formigas">Formigas Cortadeiras</SelectItem>
                          <SelectItem value="insetos">Insetos (Lagartas, Percevejos)</SelectItem>
                          <SelectItem value="doencas">Doenças</SelectItem>
                          <SelectItem value="ervas-daninhas">Ervas Daninhas</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pestSpecies">Espécie da Praga</Label>
                      <Input
                        id="pestSpecies"
                        value={recordForm.pestSpecies}
                        onChange={(e) => setRecordForm({ ...recordForm, pestSpecies: e.target.value })}
                        placeholder="Ex: Microcyclus ulei, Atta sexdens"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="severity">Severidade *</Label>
                      <Select
                        value={recordForm.severity}
                        onValueChange={(value: any) => setRecordForm({ ...recordForm, severity: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="controlType">Tipo de Controle *</Label>
                      <Select
                        value={recordForm.controlType}
                        onValueChange={(value: any) => setRecordForm({ ...recordForm, controlType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cultural">Cultural (Limpeza, Roçadas)</SelectItem>
                          <SelectItem value="biologico">Biológico (Inimigos Naturais)</SelectItem>
                          <SelectItem value="quimico">Químico (Defensivos)</SelectItem>
                          <SelectItem value="integrado">Integrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="controlMethod">Método de Controle *</Label>
                      <Input
                        id="controlMethod"
                        value={recordForm.controlMethod}
                        onChange={(e) => setRecordForm({ ...recordForm, controlMethod: e.target.value })}
                        placeholder="Ex: Aplicação foliar, Iscas"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productUsed">Produto Utilizado *</Label>
                      <Input
                        id="productUsed"
                        value={recordForm.productUsed}
                        onChange={(e) => setRecordForm({ ...recordForm, productUsed: e.target.value })}
                        placeholder="Ex: Formicida XYZ, Fungicida ABC"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dosageUsed">Dosagem</Label>
                      <Input
                        id="dosageUsed"
                        value={recordForm.dosageUsed}
                        onChange={(e) => setRecordForm({ ...recordForm, dosageUsed: e.target.value })}
                        placeholder="Ex: 100ml/ha, 5g/planta"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicationDate">Data de Aplicação *</Label>
                      <Input
                        id="applicationDate"
                        type="date"
                        value={recordForm.applicationDate}
                        onChange={(e) => setRecordForm({ ...recordForm, applicationDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={recordForm.status}
                        onValueChange={(value: any) => setRecordForm({ ...recordForm, status: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em-tratamento">Em Tratamento</SelectItem>
                          <SelectItem value="controlado">Controlado</SelectItem>
                          <SelectItem value="monitoramento">Monitoramento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affectedArea">Descrição da Área Afetada *</Label>
                      <Input
                        id="affectedArea"
                        value={recordForm.affectedArea}
                        onChange={(e) => setRecordForm({ ...recordForm, affectedArea: e.target.value })}
                        placeholder="Ex: Quadrante norte, próximo ao córrego"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affectedTreesCount">Número de Árvores Afetadas</Label>
                      <Input
                        id="affectedTreesCount"
                        type="number"
                        value={recordForm.affectedTreesCount}
                        onChange={(e) => setRecordForm({ ...recordForm, affectedTreesCount: e.target.value })}
                        placeholder="Ex: 50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affectedHectares">Hectares Afetados</Label>
                      <Input
                        id="affectedHectares"
                        type="number"
                        step="0.1"
                        value={recordForm.affectedHectares}
                        onChange={(e) => setRecordForm({ ...recordForm, affectedHectares: e.target.value })}
                        placeholder="Ex: 2.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="epiUsed"
                          checked={recordForm.epiUsed}
                          onCheckedChange={(checked) => setRecordForm({ ...recordForm, epiUsed: checked as boolean })}
                        />
                        <Label htmlFor="epiUsed" className="cursor-pointer">
                          EPI Utilizado
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={recordForm.notes}
                      onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                      placeholder="Informações adicionais sobre a praga, sintomas observados, eficácia do tratamento..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Foto da Praga/Área Afetada</Label>
                    {!photoPreview && !editingRecord?.photoUrl ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("photoUpload")?.click()}
                          className="w-full"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Adicionar Foto
                        </Button>
                        <input
                          id="photoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          <img
                            src={photoPreview || editingRecord?.photoUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removePhoto}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {!photoPreview && editingRecord?.photoUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("photoUpload")?.click()}
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Alterar Foto
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit">{editingRecord ? "Atualizar" : "Registrar"}</Button>
                    <Button type="button" variant="outline" onClick={resetRecordForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registros de Pragas</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em-tratamento">Em Tratamento</SelectItem>
                      <SelectItem value="controlado">Controlado</SelectItem>
                      <SelectItem value="monitoramento">Monitoramento</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bug className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum registro encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record) => {
                    const statusInfo = getStatusBadge(record.status)
                    const severityInfo = getSeverityBadge(record.severity)
                    const SeverityIcon = severityInfo.icon

                    return (
                      <Card
                        key={record.id}
                        className="border-l-4"
                        style={{
                          borderLeftColor:
                            record.severity === "alta"
                              ? "rgb(220, 38, 38)"
                              : record.severity === "media"
                                ? "rgb(234, 179, 8)"
                                : "rgb(34, 197, 94)",
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              <Bug className="h-5 w-5 mt-1 text-muted-foreground" />
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold">{getPestTypeLabel(record.pestType)}</h4>
                                  {record.pestSpecies && (
                                    <span className="text-sm text-muted-foreground italic">({record.pestSpecies})</span>
                                  )}
                                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                  <Badge variant={severityInfo.variant} className="gap-1">
                                    <SeverityIcon className="h-3 w-3" />
                                    {severityInfo.label}
                                  </Badge>
                                  <Badge variant="outline">{getControlTypeLabel(record.controlType)}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Seção {record.taskSection} - {record.workerName}
                                </p>
                              </div>
                            </div>
                            {/* Removida verificação canManage */}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditRecord(record)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteRecord(record.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* </CHANGE> */}
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 mb-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Método:</span> {record.controlMethod}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Produto:</span> {record.productUsed}
                            </div>
                            {record.dosageUsed && (
                              <div>
                                <span className="text-muted-foreground">Dosagem:</span> {record.dosageUsed}
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Data:</span>{" "}
                              {new Date(record.applicationDate).toLocaleDateString("pt-BR")}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Área:</span> {record.affectedArea}
                            </div>
                            {record.affectedTreesCount && (
                              <div>
                                <span className="text-muted-foreground">Árvores Afetadas:</span>{" "}
                                {record.affectedTreesCount}
                              </div>
                            )}
                            {record.affectedHectares && (
                              <div>
                                <span className="text-muted-foreground">Hectares:</span> {record.affectedHectares}ha
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">EPI:</span> {record.epiUsed ? "Sim" : "Não"}
                            </div>
                          </div>

                          {record.notes && (
                            <div className="text-sm bg-muted/50 p-3 rounded-md mb-3">
                              <span className="text-muted-foreground">Observações:</span> {record.notes}
                            </div>
                          )}

                          {record.photoUrl && (
                            <div className="mt-2">
                              <strong className="block mb-1">Foto:</strong>
                              <img
                                src={record.photoUrl || "/placeholder.svg"}
                                alt="Foto da praga"
                                className="w-full max-w-sm rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(record.photoUrl, "_blank")}
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                            <span>Registrado por {record.registeredByName}</span>
                            <span>{new Date(record.createdAt).toLocaleString("pt-BR")}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapeamento" className="space-y-4">
          {/* Removida verificação canManage */}
          <Button onClick={() => setIsAddingAreaMap(!isAddingAreaMap)} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAddingAreaMap ? "Cancelar" : "Novo Mapeamento"}
          </Button>
          {/* </CHANGE> */}

          {isAddingAreaMap && (
            <Card>
              <CardHeader>
                <CardTitle>Mapeamento de Área / Talhão</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAreaMapSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="taskSection">Seção/Talhão *</Label>
                      <Select
                        value={areaMapForm.taskSection}
                        onValueChange={(value) => setAreaMapForm({ ...areaMapForm, taskSection: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a seção" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSections.map((item) => (
                            <SelectItem key={item.section} value={item.section}>
                              {item.section} - {item.worker}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plantAge">Idade das Plantas (anos) *</Label>
                      <Input
                        id="plantAge"
                        type="number"
                        value={areaMapForm.plantAge}
                        onChange={(e) => setAreaMapForm({ ...areaMapForm, plantAge: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalTrees">Total de Árvores *</Label>
                      <Input
                        id="totalTrees"
                        type="number"
                        value={areaMapForm.totalTrees}
                        onChange={(e) => setAreaMapForm({ ...areaMapForm, totalTrees: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hectares">Hectares *</Label>
                      <Input
                        id="hectares"
                        type="number"
                        step="0.1"
                        value={areaMapForm.hectares}
                        onChange={(e) => setAreaMapForm({ ...areaMapForm, hectares: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="soilType">Tipo de Solo</Label>
                      <Input
                        id="soilType"
                        value={areaMapForm.soilType}
                        onChange={(e) => setAreaMapForm({ ...areaMapForm, soilType: e.target.value })}
                        placeholder="Ex: Latossolo, Argisolo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="irrigationType">Tipo de Irrigação</Label>
                      <Input
                        id="irrigationType"
                        value={areaMapForm.irrigationType}
                        onChange={(e) => setAreaMapForm({ ...areaMapForm, irrigationType: e.target.value })}
                        placeholder="Ex: Gotejamento, Aspersão"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={areaMapForm.notes}
                      onChange={(e) => setAreaMapForm({ ...areaMapForm, notes: e.target.value })}
                      placeholder="Localização, características do terreno, histórico..."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit">Salvar Mapeamento</Button>
                    <Button type="button" variant="outline" onClick={resetAreaMapForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* </CHANGE> */}

          <div className="grid gap-4 md:grid-cols-2">
            {areaMaps.map((area) => (
              <Card key={area.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Seção {area.taskSection} - {area.workerName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {area.totalTrees} árvores • {area.hectares}ha • {area.plantAge} anos
                      </p>
                    </div>
                    {/* Removida verificação canManage */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Deseja excluir este mapeamento?")) {
                          deletePestControlAreaMap(area.id)
                          loadAllData()
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {/* </CHANGE> */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {area.soilType && (
                    <div>
                      <span className="text-muted-foreground">Solo:</span> {area.soilType}
                    </div>
                  )}
                  {area.irrigationType && (
                    <div>
                      <span className="text-muted-foreground">Irrigação:</span> {area.irrigationType}
                    </div>
                  )}
                  {area.lastInspectionDate && (
                    <div>
                      <span className="text-muted-foreground">Última Inspeção:</span>{" "}
                      {new Date(area.lastInspectionDate).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {area.notes && (
                    <div className="bg-muted/50 p-2 rounded-md mt-2">
                      <span className="text-muted-foreground">Obs:</span> {area.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {areaMaps.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma área mapeada ainda</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cronograma" className="space-y-4">
          {/* Removida verificação canManage */}
          <Button onClick={() => setIsAddingSchedule(!isAddingSchedule)} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAddingSchedule ? "Cancelar" : "Nova Inspeção"}
          </Button>
          {/* </CHANGE> */}

          {isAddingSchedule && (
            <Card>
              <CardHeader>
                <CardTitle>Agendar Inspeção</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="taskSection">Seção *</Label>
                      <Select
                        value={scheduleForm.taskSection}
                        onValueChange={(value) => setScheduleForm({ ...scheduleForm, taskSection: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSections.map((item) => (
                            <SelectItem key={item.section} value={item.section}>
                              {item.section} - {item.worker}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Data *</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={scheduleForm.scheduledDate}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequência *</Label>
                      <Select
                        value={scheduleForm.frequency}
                        onValueChange={(value: any) => setScheduleForm({ ...scheduleForm, frequency: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="quinzenal">Quinzenal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit">Agendar</Button>
                    <Button type="button" variant="outline" onClick={resetScheduleForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* </CHANGE> */}

          <div className="grid gap-4">
            {inspectionSchedules.map((schedule) => (
              <Card key={schedule.id} className="glass-panel border-none shadow-xl card-hover group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-black text-xl tracking-tight text-foreground/90 uppercase">
                            Seção {schedule.taskSection}
                          </h4>
                          <Badge variant={schedule.status === "agendada" ? "default" : "secondary"} className="font-black uppercase text-[10px] px-2 py-0.5">
                            {schedule.status === "agendada" ? "Agendada" : "Realizada"}
                          </Badge>
                          <Badge variant="outline" className="font-black uppercase text-[10px] px-2 py-0.5 border-primary/20">
                            {schedule.frequency}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-wider">
                          Data: {new Date(schedule.scheduledDate).toLocaleDateString("pt-BR")} • Produtor: {schedule.workerName}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground/40 mt-1">
                          Inspetor: {schedule.inspectorName}
                        </p>
                        {schedule.findings && (
                          <div className="text-sm mt-4 bg-primary/[0.03] p-4 rounded-xl border border-primary/5 font-medium leading-relaxed">
                            {schedule.findings}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => {
                        if (confirm("Deseja excluir esta inspeção?")) {
                          deletePestInspectionSchedule(schedule.id)
                          loadAllData()
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {inspectionSchedules.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma inspeção agendada</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fiscalizacao" className="space-y-4">
          {/* Removida verificação canManage */}
          <Button onClick={() => setIsAddingChecklist(!isAddingChecklist)} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAddingChecklist ? "Cancelar" : "Nova Fiscalização"}
          </Button>
          {/* </CHANGE> */}

          {isAddingChecklist && (
            <Card>
              <CardHeader>
                <CardTitle>Checklist de Fiscalização</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChecklistSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="inspectionSchedule">Inspeção Agendada (Opcional)</Label>
                      <Select
                        value={selectedSchedule?.id}
                        onValueChange={(value) => {
                          const schedule = inspectionSchedules.find((s) => s.id === value)
                          setSelectedSchedule(schedule || null)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {inspectionSchedules
                            .filter((s) => s.status === "agendada")
                            .map((schedule) => (
                              <SelectItem key={schedule.id} value={schedule.id}>
                                {schedule.taskSection} - {new Date(schedule.scheduledDate).toLocaleDateString("pt-BR")}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taskSection">Seção *</Label>
                      <Select
                        value={checklistForm.taskSection} // This is now derived from selectedSchedule
                        onValueChange={(value) => setChecklistForm({ ...checklistForm, taskSection: value })}
                        required
                        disabled={!!selectedSchedule} // Disable if schedule is selected
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSections.map((item) => (
                            <SelectItem key={item.section} value={item.section}>
                              {item.section} - {item.worker}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inspectionDate">Data da Inspeção *</Label>
                      <Input
                        id="inspectionDate"
                        type="date"
                        value={checklistForm.inspectionDate}
                        onChange={(e) => setChecklistForm({ ...checklistForm, inspectionDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="controlEffectiveness">Eficácia do Controle *</Label>
                      <Select
                        value={checklistForm.controlEffectiveness}
                        onValueChange={(value: any) =>
                          setChecklistForm({ ...checklistForm, controlEffectiveness: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excelente">Excelente</SelectItem>
                          <SelectItem value="boa">Boa</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="ruim">Ruim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pestPresence"
                        checked={checklistForm.pestPresence}
                        onCheckedChange={(checked) =>
                          setChecklistForm({ ...checklistForm, pestPresence: checked as boolean })
                        }
                      />
                      <Label htmlFor="pestPresence" className="cursor-pointer">
                        Presença de Pragas/Sintomas
                      </Label>
                    </div>

                    {checklistForm.pestPresence && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="pestSeverity">Severidade</Label>
                        <Select
                          value={checklistForm.pestSeverity}
                          onValueChange={(value: any) => setChecklistForm({ ...checklistForm, pestSeverity: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="epiCompliance"
                        checked={checklistForm.epiCompliance}
                        onCheckedChange={(checked) =>
                          setChecklistForm({ ...checklistForm, epiCompliance: checked as boolean })
                        }
                      />
                      <Label htmlFor="epiCompliance" className="cursor-pointer">
                        Uso Correto de EPIs
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="productApplication"
                        checked={checklistForm.productApplication}
                        onCheckedChange={(checked) =>
                          setChecklistForm({ ...checklistForm, productApplication: checked as boolean })
                        }
                      />
                      <Label htmlFor="productApplication" className="cursor-pointer">
                        Aplicação de Produto Realizada
                      </Label>
                    </div>

                    {checklistForm.productApplication && (
                      <div className="ml-6 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="productUsed">Produto</Label>
                          <Input
                            id="productUsed"
                            value={checklistForm.productUsed}
                            onChange={(e) => setChecklistForm({ ...checklistForm, productUsed: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dosage">Dosagem</Label>
                          <Input
                            id="dosage"
                            value={checklistForm.dosage}
                            onChange={(e) => setChecklistForm({ ...checklistForm, dosage: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="treatmentArea">Área Tratada</Label>
                          <Input
                            id="treatmentArea"
                            value={checklistForm.treatmentArea}
                            onChange={(e) => setChecklistForm({ ...checklistForm, treatmentArea: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="applicationRecord"
                        checked={checklistForm.applicationRecord}
                        onCheckedChange={(checked) =>
                          setChecklistForm({ ...checklistForm, applicationRecord: checked as boolean })
                        }
                      />
                      <Label htmlFor="applicationRecord" className="cursor-pointer">
                        Registro de Atividades Atualizado
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações *</Label>
                    <Textarea
                      id="observations"
                      value={checklistForm.observations}
                      onChange={(e) => setChecklistForm({ ...checklistForm, observations: e.target.value })}
                      required
                      rows={4}
                      placeholder="Descreva os achados da inspeção, condições gerais, recomendações..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Foto da Inspeção</Label>
                    {!checklistPhotoPreview ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("checklistPhotoUpload")?.click()}
                          className="w-full"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Adicionar Foto
                        </Button>
                        <input
                          id="checklistPhotoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleChecklistPhotoChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          <img
                            src={checklistPhotoPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleChecklistPhotoRemove}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit">Salvar Checklist</Button>
                    <Button type="button" variant="outline" onClick={resetChecklistForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* </CHANGE> */}

          <div className="grid gap-4">
            {inspectionChecklists
              .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
              .map((checklist) => (
                <Card key={checklist.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {checklist.taskSection} - {new Date(checklist.inspectionDate).toLocaleDateString("pt-BR")}
                      </CardTitle>
                      <Badge
                        variant={
                          checklist.controlEffectiveness === "excelente" || checklist.controlEffectiveness === "boa"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {checklist.controlEffectiveness}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Inspetor:</strong> {checklist.inspectorName}
                      </p>
                      <p>
                        <strong>Presença de Pragas:</strong> {checklist.pestPresence ? "Sim" : "Não"}
                        {checklist.pestPresence && checklist.pestSeverity && ` (${checklist.pestSeverity})`}
                      </p>
                      <p>
                        <strong>Efetividade do Controle:</strong> {checklist.controlEffectiveness}
                      </p>
                      <p>
                        <strong>Conformidade com EPI:</strong> {checklist.epiCompliance ? "Sim" : "Não"}
                      </p>
                      {checklist.productApplication && (
                        <>
                          <p>
                            <strong>Produto Aplicado:</strong> {checklist.productUsed}
                          </p>
                          {checklist.dosage && (
                            <p>
                              <strong>Dosagem:</strong> {checklist.dosage}
                            </p>
                          )}
                          {checklist.treatmentArea && (
                            <p>
                              <strong>Área Tratada:</strong> {checklist.treatmentArea}
                            </p>
                          )}
                        </>
                      )}
                      <p>
                        <strong>Observações:</strong> {checklist.observations}
                      </p>
                      {checklist.photoUrl && (
                        <div className="mt-2">
                          <strong className="block mb-1">Foto da Inspeção:</strong>
                          <img
                            src={checklist.photoUrl || "/placeholder.svg"}
                            alt="Foto da inspeção"
                            className="w-full max-w-sm rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(checklist.photoUrl, "_blank")}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            {inspectionChecklists.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma fiscalização realizada</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="treinamento" className="space-y-4">
          {/* Removida verificação canManage */}
          <Button onClick={() => setIsAddingTraining(!isAddingTraining)} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAddingTraining ? "Cancelar" : "Novo Treinamento"}
          </Button>
          {/* </CHANGE> */}

          {isAddingTraining && (
            <Card>
              <CardHeader>
                <CardTitle>Registrar Treinamento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrainingSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="trainingDate">Data *</Label>
                      <Input
                        id="trainingDate"
                        type="date"
                        value={trainingForm.trainingDate}
                        onChange={(e) => setTrainingForm({ ...trainingForm, trainingDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (horas) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        step="0.5"
                        value={trainingForm.duration}
                        onChange={(e) => setTrainingForm({ ...trainingForm, duration: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trainingTopic">Tema do Treinamento *</Label>
                      <Input
                        id="trainingTopic"
                        value={trainingForm.trainingTopic}
                        onChange={(e) => setTrainingForm({ ...trainingForm, trainingTopic: e.target.value })}
                        placeholder="Ex: Identificação de Pragas"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trainer">Instrutor *</Label>
                      <Input
                        id="trainer"
                        value={trainingForm.trainer}
                        onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topics">Tópicos Abordados (separados por vírgula) *</Label>
                    <Input
                      id="topics"
                      value={trainingForm.topics}
                      onChange={(e) => setTrainingForm({ ...trainingForm, topics: e.target.value })}
                      placeholder="Ex: Formigas cortadeiras, Mal-das-folhas, Aplicação segura"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Participantes *</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {workers.map((worker) => (
                        <div key={worker.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`worker-${worker.id}`}
                            checked={selectedParticipants.includes(worker.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedParticipants([...selectedParticipants, worker.id])
                              } else {
                                setSelectedParticipants(selectedParticipants.filter((id) => id !== worker.id))
                              }
                            }}
                          />
                          <Label htmlFor={`worker-${worker.id}`} className="cursor-pointer">
                            {worker.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certificate"
                      checked={trainingForm.certificate}
                      onCheckedChange={(checked) =>
                        setTrainingForm({ ...trainingForm, certificate: checked as boolean })
                      }
                    />
                    <Label htmlFor="certificate" className="cursor-pointer">
                      Certificado Emitido
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={trainingForm.notes}
                      onChange={(e) => setTrainingForm({ ...trainingForm, notes: e.target.value })}
                      placeholder="Informações adicionais sobre o treinamento..."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit">Salvar Treinamento</Button>
                    <Button type="button" variant="outline" onClick={resetTrainingForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* </CHANGE> */}

          <div className="grid gap-4">
            {trainings.map((training) => (
              <Card key={training.id} className="glass-panel border-none shadow-xl card-hover group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20 group-hover:bg-secondary group-hover:text-white transition-all">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-black text-xl tracking-tight text-foreground/90 uppercase">{training.trainingTopic}</h4>
                          {training.certificate && <Badge variant="secondary" className="font-black uppercase text-[10px] bg-secondary/10 text-secondary border-none px-3">Certificado</Badge>}
                        </div>
                        <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-wider mb-4">
                          {new Date(training.trainingDate).toLocaleDateString("pt-BR")} • {training.duration}h • Instrutor: {training.trainer}
                        </p>

                        <div className="space-y-4 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Tópicos:</span>
                            <div className="font-bold text-foreground/80">{training.topics.join(", ")}</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">
                              Participantes ({training.participants.length}):
                            </span>
                            <div className="font-bold text-foreground/80">{training.participantNames.join(", ")}</div>
                          </div>
                          {training.notes && (
                            <div className="bg-secondary/[0.03] p-4 rounded-xl border border-secondary/5 font-medium leading-relaxed italic">
                              "{training.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => {
                        if (confirm("Deseja excluir este treinamento?")) {
                          deletePestControlTraining(training.id)
                          loadAllData()
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {trainings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum treinamento registrado</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metricas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Desempenho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Resolução</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {stats.total > 0 ? Math.round((stats.controlado / stats.total) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.controlado} de {stats.total} controlados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conformidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {inspectionChecklists.length > 0
                        ? Math.round(
                          (inspectionChecklists.filter((c) => c.epiCompliance && c.applicationRecord).length /
                            inspectionChecklists.length) *
                          100,
                        )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">EPI e Registros em dia</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Inspeções Realizadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {inspectionSchedules.length > 0
                        ? Math.round(
                          (inspectionSchedules.filter((s) => s.status === "realizada").length /
                            inspectionSchedules.length) *
                          100,
                        )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inspectionSchedules.filter((s) => s.status === "realizada").length} de{" "}
                      {inspectionSchedules.length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribuição de Pragas por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      records.reduce(
                        (acc, r) => {
                          acc[r.pestType] = (acc[r.pestType] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{getPestTypeLabel(type as any)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(count / records.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Métodos de Controle Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      records.reduce(
                        (acc, r) => {
                          acc[r.controlType] = (acc[r.controlType] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{getControlTypeLabel(type as any)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${(count / records.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
