export type UserRole = "worker" | "inspector" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export interface Task {
  id: string
  workerId: string
  workerName: string
  date: string
  taskType: "A" | "B" | "C" | "D"
  status: "pending" | "in-progress" | "completed" | "inspected"
  productionKg: number
  inspectionId?: string
  createdAt: string
  completedAt?: string
  lastTappingDate?: string // último dia que foi sangrado
}

export interface Inspection {
  id: string
  taskId: string
  inspectorId: string
  inspectorName: string
  date: string
  angle: number // 1-5 rating
  depth: number // 1-5 rating
  injuries: number // 1-5 rating (5 = no injuries)
  spoutCleanliness: number // 1-5 rating
  overallScore: number
  notes: string
  createdAt: string
}

export interface ProductionRecord {
  id: string
  workerId: string
  workerName: string
  date: string
  taskType: "A" | "B" | "C" | "D"
  productionKg: number
  createdAt: string
}

export interface MonthlyWeighing {
  id: string
  workerId: string
  workerName: string
  month: string // formato: "2025-01" (ano-mês)
  productionKg: number
  registeredBy: string // ID do admin que registrou
  registeredByName: string
  createdAt: string
}

export interface TreeSection {
  section: string
  treeCount: number
}

export interface WorkerTreeInventory {
  id: string
  workerName: string
  sections: TreeSection[]
  totalTrees: number
  extraTrees?: number
  code: string // A, B, C, D, E, F, G
}

export interface StimulationRecord {
  id: string
  taskSection: string // A1, B2, C3, etc.
  workerName: string
  workerId: string
  applicationDate: string // formato: "2025-01-15"
  notes?: string
  registeredBy: string
  registeredByName: string
  createdAt: string
}

export interface PestControlRecord {
  id: string
  taskSection: string // A1, B2, C3, etc.
  workerName: string
  workerId: string
  pestType: "formigas" | "fungos" | "insetos" | "doencas" | "ervas-daninhas" | "outro"
  pestSpecies?: string // Ex: "Microcyclus ulei", "Atta sexdens"
  controlMethod: string
  controlType: "cultural" | "biologico" | "quimico" | "integrado"
  productUsed: string
  applicationDate: string
  status: "pendente" | "em-tratamento" | "controlado" | "monitoramento"
  severity: "baixa" | "media" | "alta"
  affectedArea: string // descrição da área afetada
  affectedTreesCount?: number
  affectedHectares?: number
  notes?: string
  epiUsed?: boolean
  dosageUsed?: string
  registeredBy: string
  registeredByName: string
  createdAt: string
  resolvedAt?: string
  photoUrl?: string
}

export interface PestControlAreaMap {
  id: string
  taskSection: string
  workerName: string
  workerId: string
  plantAge: number // anos
  totalTrees: number
  hectares: number
  pestHistory: string[] // histórico de pragas anteriores
  lastInspectionDate?: string
  soilType?: string
  irrigationType?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PestInspectionSchedule {
  id: string
  taskSection: string
  workerName: string
  workerId: string
  scheduledDate: string
  frequency: "semanal" | "quinzenal" | "mensal"
  inspectorId: string
  inspectorName: string
  status: "agendada" | "realizada" | "cancelada"
  completedDate?: string
  findings?: string
  createdAt: string
}

export interface PestInspectionChecklist {
  id: string
  inspectionScheduleId: string
  taskSection: string
  inspectionDate: string
  inspectorId: string
  inspectorName: string
  pestPresence: boolean
  pestSeverity?: "baixa" | "media" | "alta"
  controlEffectiveness: "excelente" | "boa" | "regular" | "ruim"
  epiCompliance: boolean
  productApplication: boolean
  applicationRecord: boolean
  treatmentArea?: string
  productUsed?: string
  dosage?: string
  observations: string
  photoUrl?: string
  createdAt: string
}

export interface PestControlTraining {
  id: string
  trainingDate: string
  trainingTopic: string
  trainer: string
  participants: string[] // worker IDs
  participantNames: string[]
  duration: number // horas
  topics: string[] // tópicos abordados
  certificate?: boolean
  notes?: string
  registeredBy: string
  registeredByName: string
  createdAt: string
}

export interface PestControlMetrics {
  month: string // formato: "2025-01"
  totalInfestations: number
  resolvedInfestations: number
  avgResolutionDays: number
  latexProductionKg: number
  treesAffected: number
  complianceRate: number // porcentagem
  inspectionsCompleted: number
  inspectionsScheduled: number
}

export interface WorkerPerformanceRating {
  id: string
  workerId: string
  workerName: string
  month: string // formato: "2025-01"
  productionScore: number // 0-10
  qualityScore: number // 0-10
  disciplineScore: number // 0-10 (inclui frequência e recuperação)
  overallScore: number // calculado automaticamente
  notes?: string
  ratedBy: string
  ratedByName: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceRecord {
  id: string
  workerId: string
  workerName: string
  date: string // formato: "2025-01-15"
  status: "sangria-realizada" | "falta" | "falta-chuva" | "tarefa-recuperada"
  taskSection?: string // A1, B2, C3, etc. (quando for sangria ou recuperação)
  rainfallMm?: number // Quantidade de chuva em mm
  notes?: string
  registeredBy: string
  registeredByName: string
  createdAt: string
}

export interface RainfallRecord {
  id: string
  date: string // formato: "2025-01-15"
  amountMm: number
  notes?: string
  registeredBy: string
  registeredByName: string
  createdAt: string
}
