
import { supabase } from "./supabase"
import type {
  Task,
  Inspection,
  ProductionRecord,
  User,
  MonthlyWeighing,
  StimulationRecord,
  PestControlRecord,
  PestControlAreaMap,
  PestInspectionSchedule,
  PestInspectionChecklist,
  PestControlTraining,
  WorkerPerformanceRating,
  AttendanceRecord,
  RainfallRecord,
} from "./types"

// --- Helper Functions ---
function dispatchStorageUpdate() {
  if (typeof window !== "undefined") {
    // Notify components to re-fetch data
    window.dispatchEvent(new Event("dataUpdated"))
    window.dispatchEvent(new Event("storage-update"))
  }
}

// --- Tasks ---

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from("tasks").select("*")
  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
  return (data || []).map((t: any) => ({
    id: t.id,
    workerId: t.worker_id,
    workerName: t.worker_name,
    date: t.date,
    taskType: t.task_type,
    status: t.status,
    productionKg: t.production_kg,
    inspectionId: t.inspection_id,
    lastTappingDate: t.last_tapping_date,
    completedAt: t.completed_at,
    createdAt: t.created_at,
  }))
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  // Deprecated in favor of direct DB inserts/updates
}

export async function addTask(task: Task): Promise<void> {
  const dbTask = {
    // id: task.id,
    worker_id: task.workerId,
    worker_name: task.workerName,
    date: task.date,
    task_type: task.taskType,
    status: task.status,
    production_kg: task.productionKg,
    inspection_id: task.inspectionId,
    last_tapping_date: task.lastTappingDate,
    completed_at: task.completedAt,
    created_at: task.createdAt,
  }
  const { error } = await supabase.from("tasks").insert([dbTask])
  if (error) console.error("Error adding task:", error)
  else dispatchStorageUpdate()
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  // Special logic: Auto-set lastTappingDate when completing a task
  if (updates.status === "completed" && !updates.lastTappingDate) {
    updates.lastTappingDate = new Date().toISOString().split("T")[0]
  }

  const dbUpdates: any = {}
  if (updates.status) dbUpdates.status = updates.status
  if (updates.productionKg !== undefined) dbUpdates.production_kg = updates.productionKg
  if (updates.inspectionId) dbUpdates.inspection_id = updates.inspectionId
  if (updates.lastTappingDate) dbUpdates.last_tapping_date = updates.lastTappingDate
  if (updates.completedAt) dbUpdates.completed_at = updates.completedAt

  const { error } = await supabase.from("tasks").update(dbUpdates).eq("id", taskId)
  if (error) console.error("Error updating task:", error)
  else dispatchStorageUpdate()
}

// --- Inspections ---

export async function getInspections(): Promise<Inspection[]> {
  const { data, error } = await supabase.from("inspections").select("*")
  if (error) {
    console.error("Error fetching inspections:", error)
    return []
  }
  return (data || []).map((i: any) => ({
    id: i.id,
    taskId: i.task_id,
    inspectorId: i.inspector_id,
    inspectorName: i.inspector_name,
    date: i.date,
    angle: i.angle,
    depth: i.depth,
    injuries: i.injuries,
    spoutCleanliness: i.spout_cleanliness,
    overallScore: i.overall_score,
    notes: i.notes,
    createdAt: i.created_at,
  }))
}

export async function saveInspections(inspections: Inspection[]): Promise<void> { }

export async function addInspection(inspection: Inspection): Promise<void> {
  const dbInspection = {
    task_id: inspection.taskId,
    inspector_id: inspection.inspectorId,
    inspector_name: inspection.inspectorName,
    date: inspection.date,
    angle: inspection.angle,
    depth: inspection.depth,
    injuries: inspection.injuries,
    spout_cleanliness: inspection.spoutCleanliness,
    overall_score: inspection.overallScore,
    notes: inspection.notes,
    created_at: inspection.createdAt,
  }
  const { error } = await supabase.from("inspections").insert([dbInspection])
  if (error) console.error("Error adding inspection:", error)
  else dispatchStorageUpdate()
}

// --- Production Records ---

export async function getProductionRecords(): Promise<ProductionRecord[]> {
  const { data, error } = await supabase.from("production_records").select("*")
  if (error) {
    console.error("Error fetching production records:", error)
    return []
  }
  return (data || []).map((p: any) => ({
    id: p.id,
    workerId: p.worker_id,
    workerName: p.worker_name,
    date: p.date,
    taskType: p.task_type,
    productionKg: p.production_kg,
    createdAt: p.created_at,
  }))
}

export async function saveProductionRecords(records: ProductionRecord[]): Promise<void> { }

export async function addProductionRecord(record: ProductionRecord): Promise<void> {
  const dbRecord = {
    worker_id: record.workerId,
    worker_name: record.workerName,
    date: record.date,
    task_type: record.taskType,
    production_kg: record.productionKg,
    created_at: record.createdAt,
  }
  const { error } = await supabase.from("production_records").insert([dbRecord])
  if (error) console.error("Error adding production record:", error)
  else dispatchStorageUpdate()
}

// --- Monthly Weighings ---

export async function getMonthlyWeighings(): Promise<MonthlyWeighing[]> {
  const { data, error } = await supabase.from("monthly_weighings").select("*")
  if (error) {
    console.error("Error fetching monthly weighings:", error)
    return []
  }
  return (data || []).map((w: any) => ({
    id: w.id,
    workerId: w.worker_id,
    workerName: w.worker_name,
    month: w.month,
    productionKg: w.production_kg,
    registeredBy: w.registered_by,
    registeredByName: w.registered_by_name,
    createdAt: w.created_at,
  }))
}

export async function saveMonthlyWeighings(weighings: MonthlyWeighing[]): Promise<void> { }

export async function addMonthlyWeighing(weighing: MonthlyWeighing): Promise<void> {
  const dbWeighing = {
    worker_id: weighing.workerId,
    worker_name: weighing.workerName,
    month: weighing.month,
    production_kg: weighing.productionKg,
    registered_by: weighing.registeredBy,
    registered_by_name: weighing.registeredByName,
    created_at: weighing.createdAt,
  }
  const { error } = await supabase.from("monthly_weighings").insert([dbWeighing])
  if (error) console.error("Error adding monthly weighing:", error)
  else dispatchStorageUpdate()
}

export async function updateMonthlyWeighing(weighingId: string, updates: Partial<MonthlyWeighing>): Promise<void> {
  const dbUpdates: any = {}
  if (updates.productionKg !== undefined) dbUpdates.production_kg = updates.productionKg

  const { error } = await supabase.from("monthly_weighings").update(dbUpdates).eq("id", weighingId)
  if (error) console.error("Error updating monthly weighing:", error)
  else dispatchStorageUpdate()
}

// --- Stimulation Records ---

// --- Stimulation Records ---

export async function getStimulationRecords(): Promise<StimulationRecord[]> {
  const { data, error } = await supabase.from("stimulation_records").select("*")
  if (error) {
    console.error("Error fetching stimulation records:", error)
    return []
  }
  return (data || []).map((record: any) => ({
    id: record.id,
    taskSection: record.task_section,
    workerName: record.worker_name,
    workerId: record.worker_id,
    applicationDate: record.application_date,
    notes: record.notes,
    registeredBy: record.registered_by,
    registeredByName: record.registered_by_name,
    createdAt: record.created_at,
  }))
}

export async function saveStimulationRecords(records: StimulationRecord[]): Promise<void> { }

export async function addStimulationRecord(record: StimulationRecord): Promise<void> {
  const dbRecord = {
    // id: record.id, // Let Supabase generate ID or use if provided and valid uuid
    task_section: record.taskSection,
    worker_name: record.workerName,
    worker_id: record.workerId,
    application_date: record.applicationDate,
    notes: record.notes,
    registered_by: record.registeredBy,
    registered_by_name: record.registeredByName,
    created_at: record.createdAt,
  }
  const { error } = await supabase.from("stimulation_records").insert([dbRecord])
  if (error) console.error("Error adding stimulation record:", error)
  else dispatchStorageUpdate()
}

export async function deleteStimulationRecord(recordId: string): Promise<void> {
  const { error } = await supabase.from("stimulation_records").delete().eq("id", recordId)
  if (error) console.error("Error deleting stimulation record:", error)
  else dispatchStorageUpdate()
}

// --- Pest Control Records ---

export async function getPestControlRecords(): Promise<PestControlRecord[]> {
  const { data, error } = await supabase.from("pest_control_records").select("*")
  if (error) {
    console.error("Error fetching pest control records:", error)
    return []
  }
  return (data || []).map((record: any) => ({
    id: record.id,
    taskSection: record.task_section,
    workerName: record.worker_name,
    workerId: record.worker_id,
    pestType: record.pest_type,
    pestSpecies: record.pest_species,
    controlMethod: record.control_method,
    controlType: record.control_type,
    productUsed: record.product_used,
    applicationDate: record.application_date,
    status: record.status,
    severity: record.severity,
    affectedArea: record.affected_area,
    affectedTreesCount: record.affected_trees_count,
    affectedHectares: record.affected_hectares,
    notes: record.notes,
    epiUsed: record.epi_used,
    dosageUsed: record.dosage_used,
    registeredBy: record.registered_by,
    registeredByName: record.registered_by_name,
    resolvedAt: record.resolved_at,
    photoUrl: record.photo_url,
    createdAt: record.created_at,
  }))
}

export async function savePestControlRecords(records: PestControlRecord[]): Promise<void> { }

export async function addPestControlRecord(record: PestControlRecord): Promise<void> {
  const dbRecord = {
    // id: record.id,
    task_section: record.taskSection,
    worker_name: record.workerName,
    worker_id: record.workerId,
    pest_type: record.pestType,
    pest_species: record.pestSpecies,
    control_method: record.controlMethod,
    control_type: record.controlType,
    product_used: record.productUsed,
    application_date: record.applicationDate,
    status: record.status,
    severity: record.severity,
    affected_area: record.affectedArea,
    affected_trees_count: record.affectedTreesCount,
    affected_hectares: record.affectedHectares,
    notes: record.notes,
    epi_used: record.epiUsed,
    dosage_used: record.dosageUsed,
    registered_by: record.registeredBy,
    registered_by_name: record.registeredByName,
    resolved_at: record.resolvedAt,
    photo_url: record.photoUrl,
    created_at: record.createdAt,
  }
  const { error } = await supabase.from("pest_control_records").insert([dbRecord])
  if (error) console.error("Error adding pest control record:", error)
  else dispatchStorageUpdate()
}

export async function updatePestControlRecord(recordId: string, updates: Partial<PestControlRecord>): Promise<void> {
  const dbUpdates: any = {}
  if (updates.taskSection) dbUpdates.task_section = updates.taskSection
  if (updates.workerName) dbUpdates.worker_name = updates.workerName
  if (updates.workerId) dbUpdates.worker_id = updates.workerId
  if (updates.pestType) dbUpdates.pest_type = updates.pestType
  if (updates.pestSpecies) dbUpdates.pest_species = updates.pestSpecies
  if (updates.controlMethod) dbUpdates.control_method = updates.controlMethod
  if (updates.controlType) dbUpdates.control_type = updates.controlType
  if (updates.productUsed) dbUpdates.product_used = updates.productUsed
  if (updates.applicationDate) dbUpdates.application_date = updates.applicationDate
  if (updates.status) dbUpdates.status = updates.status
  if (updates.severity) dbUpdates.severity = updates.severity
  if (updates.affectedArea) dbUpdates.affected_area = updates.affectedArea
  if (updates.affectedTreesCount !== undefined) dbUpdates.affected_trees_count = updates.affectedTreesCount
  if (updates.affectedHectares !== undefined) dbUpdates.affected_hectares = updates.affectedHectares
  if (updates.notes) dbUpdates.notes = updates.notes
  if (updates.epiUsed !== undefined) dbUpdates.epi_used = updates.epiUsed
  if (updates.dosageUsed) dbUpdates.dosage_used = updates.dosageUsed
  if (updates.resolvedAt) dbUpdates.resolved_at = updates.resolvedAt
  if (updates.photoUrl) dbUpdates.photo_url = updates.photoUrl

  const { error } = await supabase.from("pest_control_records").update(dbUpdates).eq("id", recordId)
  if (error) console.error("Error updating pest control record:", error)
  else dispatchStorageUpdate()
}

export async function deletePestControlRecord(recordId: string): Promise<void> {
  const { error } = await supabase.from("pest_control_records").delete().eq("id", recordId)
  if (error) console.error("Error deleting pest control record:", error)
  else dispatchStorageUpdate()
}

// --- Users ---

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*")
  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return (data || []).map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  }))
}

export async function saveUsers(users: User[]): Promise<void> { }

export async function addUser(user: User): Promise<void> {
  const dbUser = {
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.createdAt,
  }
  const { error } = await supabase.from("users").insert([dbUser])
  if (error) console.error("Error adding user:", error)
  else dispatchStorageUpdate()
}

export async function initializeDemoData(): Promise<void> {
  console.warn("initializeDemoData is deprecated. Use cloud database.")
}

// --- Pest Control Area Maps ---
export async function getPestControlAreaMaps(): Promise<PestControlAreaMap[]> {
  const { data, error } = await supabase.from("pest_control_area_maps").select("*")
  if (error) {
    console.error("Error fetching pest area maps:", error)
    return []
  }
  return (data || []).map((map: any) => ({
    id: map.id,
    taskSection: map.task_section,
    workerName: map.worker_name,
    workerId: map.worker_id,
    plantAge: map.plant_age,
    totalTrees: map.total_trees,
    hectares: map.hectares,
    pestHistory: map.pest_history || [],
    lastInspectionDate: map.last_inspection_date,
    soilType: map.soil_type,
    irrigationType: map.irrigation_type,
    notes: map.notes,
    createdAt: map.created_at,
    updatedAt: map.updated_at,
  }))
}
export async function savePestControlAreaMaps(maps: PestControlAreaMap[]): Promise<void> { }
export async function addPestControlAreaMap(map: PestControlAreaMap): Promise<void> {
  const dbMap = {
    task_section: map.taskSection,
    worker_name: map.workerName,
    worker_id: map.workerId,
    plant_age: map.plantAge,
    total_trees: map.totalTrees,
    hectares: map.hectares,
    pest_history: map.pestHistory,
    last_inspection_date: map.lastInspectionDate,
    soil_type: map.soilType,
    irrigation_type: map.irrigationType,
    notes: map.notes,
    created_at: map.createdAt,
    updated_at: map.updatedAt,
  }
  const { error } = await supabase.from("pest_control_area_maps").insert([dbMap])
  if (error) console.error("Error adding pest area map:", error)
  else dispatchStorageUpdate()
}
export async function updatePestControlAreaMap(mapId: string, updates: Partial<PestControlAreaMap>): Promise<void> {
  const dbUpdates: any = {}
  if (updates.taskSection) dbUpdates.task_section = updates.taskSection
  if (updates.plantAge) dbUpdates.plant_age = updates.plantAge
  if (updates.totalTrees) dbUpdates.total_trees = updates.totalTrees
  if (updates.hectares) dbUpdates.hectares = updates.hectares
  if (updates.pestHistory) dbUpdates.pest_history = updates.pestHistory
  if (updates.lastInspectionDate) dbUpdates.last_inspection_date = updates.lastInspectionDate
  if (updates.updatedAt) dbUpdates.updated_at = updates.updatedAt

  const { error } = await supabase.from("pest_control_area_maps").update(dbUpdates).eq("id", mapId)
  if (error) console.error("Error updating pest area map:", error)
  else dispatchStorageUpdate()
}
export async function deletePestControlAreaMap(mapId: string): Promise<void> {
  const { error } = await supabase.from("pest_control_area_maps").delete().eq("id", mapId)
  if (error) console.error("Error deleting pest area map:", error)
  else dispatchStorageUpdate()
}

// --- Pest Inspection Schedules ---
export async function getPestInspectionSchedules(): Promise<PestInspectionSchedule[]> {
  const { data, error } = await supabase.from("pest_inspection_schedules").select("*")
  if (error) {
    console.error("Error fetching schedules:", error)
    return []
  }
  return (data || []).map((s: any) => ({
    id: s.id,
    taskSection: s.task_section,
    workerName: s.worker_name,
    workerId: s.worker_id,
    scheduledDate: s.scheduled_date,
    frequency: s.frequency,
    inspectorId: s.inspector_id,
    inspectorName: s.inspector_name,
    status: s.status,
    completedDate: s.completed_date,
    findings: s.findings,
    createdAt: s.created_at,
  }))
}
export async function savePestInspectionSchedules(schedules: PestInspectionSchedule[]): Promise<void> { }
export async function addPestInspectionSchedule(schedule: PestInspectionSchedule): Promise<void> {
  const dbSchedule = {
    task_section: schedule.taskSection,
    worker_name: schedule.workerName,
    worker_id: schedule.workerId,
    scheduled_date: schedule.scheduledDate,
    frequency: schedule.frequency,
    inspector_id: schedule.inspectorId,
    inspector_name: schedule.inspectorName,
    status: schedule.status,
    created_at: schedule.createdAt,
  }
  const { error } = await supabase.from("pest_inspection_schedules").insert([dbSchedule])
  if (error) console.error("Error adding schedule:", error)
  else dispatchStorageUpdate()
}
export async function updatePestInspectionSchedule(scheduleId: string, updates: Partial<PestInspectionSchedule>): Promise<void> {
  const dbUpdates: any = {}
  if (updates.status) dbUpdates.status = updates.status
  if (updates.completedDate) dbUpdates.completed_date = updates.completedDate
  if (updates.findings) dbUpdates.findings = updates.findings

  const { error } = await supabase.from("pest_inspection_schedules").update(dbUpdates).eq("id", scheduleId)
  if (error) console.error("Error updating schedule:", error)
  else dispatchStorageUpdate()
}
export async function deletePestInspectionSchedule(scheduleId: string): Promise<void> {
  const { error } = await supabase.from("pest_inspection_schedules").delete().eq("id", scheduleId)
  if (error) console.error("Error deleting schedule:", error)
  else dispatchStorageUpdate()
}

// --- Pest Inspection Checklists ---
export async function getPestInspectionChecklists(): Promise<PestInspectionChecklist[]> {
  const { data, error } = await supabase.from("pest_inspection_checklists").select("*")
  if (error) {
    console.error("Error fetching checklists:", error)
    return []
  }
  return (data || []).map((c: any) => ({
    id: c.id,
    inspectionScheduleId: c.inspection_schedule_id,
    taskSection: c.task_section,
    inspectionDate: c.inspection_date,
    inspectorId: c.inspector_id,
    inspectorName: c.inspector_name,
    pestPresence: c.pest_presence,
    pestSeverity: c.pest_severity,
    controlEffectiveness: c.control_effectiveness,
    epiCompliance: c.epi_compliance,
    productApplication: c.product_application,
    applicationRecord: c.application_record,
    treatmentArea: c.treatment_area,
    productUsed: c.product_used,
    dosage: c.dosage,
    observations: c.observations,
    photoUrl: c.photo_url,
    createdAt: c.created_at,
  }))
}
export async function savePestInspectionChecklists(checklists: PestInspectionChecklist[]): Promise<void> { }
export async function addPestInspectionChecklist(checklist: PestInspectionChecklist): Promise<void> {
  const dbChecklist = {
    inspection_schedule_id: checklist.inspectionScheduleId,
    task_section: checklist.taskSection,
    inspection_date: checklist.inspectionDate,
    inspector_id: checklist.inspectorId,
    inspector_name: checklist.inspectorName,
    pest_presence: checklist.pestPresence,
    pest_severity: checklist.pestSeverity,
    control_effectiveness: checklist.controlEffectiveness,
    epi_compliance: checklist.epiCompliance,
    product_application: checklist.productApplication,
    application_record: checklist.applicationRecord,
    treatment_area: checklist.treatmentArea,
    product_used: checklist.productUsed,
    dosage: checklist.dosage,
    observations: checklist.observations,
    photo_url: checklist.photoUrl,
    created_at: checklist.createdAt,
  }
  const { error } = await supabase.from("pest_inspection_checklists").insert([dbChecklist])
  if (error) console.error("Error adding checklist:", error)
  else dispatchStorageUpdate()
}
export async function updatePestInspectionChecklist(checklistId: string, updates: Partial<PestInspectionChecklist>): Promise<void> {
  const dbUpdates: any = {}
  if (updates.photoUrl) dbUpdates.photo_url = updates.photoUrl
  const { error } = await supabase.from("pest_inspection_checklists").update(dbUpdates).eq("id", checklistId)
  if (error) console.error("Error updating checklist:", error)
  else dispatchStorageUpdate()
}
export async function deletePestInspectionChecklist(checklistId: string): Promise<void> {
  const { error } = await supabase.from("pest_inspection_checklists").delete().eq("id", checklistId)
  if (error) console.error("Error deleting checklist:", error)
  else dispatchStorageUpdate()
}

// --- Pest Control Training ---
export async function getPestControlTrainings(): Promise<PestControlTraining[]> {
  const { data, error } = await supabase.from("pest_control_trainings").select("*")
  if (error) {
    console.error("Error fetching trainings:", error)
    return []
  }
  return (data || []).map((t: any) => ({
    id: t.id,
    trainingDate: t.training_date,
    trainingTopic: t.training_topic,
    trainer: t.trainer,
    participants: t.participants || [],
    participantNames: t.participant_names || [],
    duration: t.duration,
    topics: t.topics || [],
    certificate: t.certificate,
    notes: t.notes,
    registeredBy: t.registered_by,
    registeredByName: t.registered_by_name,
    createdAt: t.created_at,
  }))
}
export async function savePestControlTrainings(trainings: PestControlTraining[]): Promise<void> { }
export async function addPestControlTraining(training: PestControlTraining): Promise<void> {
  const dbTraining = {
    training_date: training.trainingDate,
    training_topic: training.trainingTopic,
    trainer: training.trainer,
    participants: training.participants,
    participant_names: training.participantNames,
    duration: training.duration,
    topics: training.topics,
    certificate: training.certificate,
    notes: training.notes,
    registered_by: training.registeredBy,
    registered_by_name: training.registeredByName,
    created_at: training.createdAt,
  }
  const { error } = await supabase.from("pest_control_trainings").insert([dbTraining])
  if (error) console.error("Error adding training:", error)
  else dispatchStorageUpdate()
}
export async function deletePestControlTraining(trainingId: string): Promise<void> {
  const { error } = await supabase.from("pest_control_trainings").delete().eq("id", trainingId)
  if (error) console.error("Error deleting training:", error)
  else dispatchStorageUpdate()
}

// --- Performance Ratings ---
export async function getPerformanceRatings(): Promise<WorkerPerformanceRating[]> {
  const { data, error } = await supabase.from("worker_performance_ratings").select("*")
  if (error) {
    console.error("Error fetching performance ratings:", error)
    return []
  }
  return (data || []).map((r: any) => ({
    id: r.id,
    workerId: r.worker_id,
    workerName: r.worker_name,
    month: r.month,
    productionScore: r.production_score,
    qualityScore: r.quality_score,
    disciplineScore: r.discipline_score,
    overallScore: r.overall_score,
    notes: r.notes,
    ratedBy: r.rated_by,
    ratedByName: r.rated_by_name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}
export async function savePerformanceRatings(ratings: WorkerPerformanceRating[]): Promise<void> { }
export async function savePerformanceRating(rating: WorkerPerformanceRating): Promise<void> {
  // Check if exists to determine insert or update
  // For simplicity using upsert if ID is provided, but since usually we generate new IDs on frontend...
  // Actually usually we should just insert. Only update if editing.

  // Try to find if it exists
  const { data } = await supabase.from("worker_performance_ratings").select("id").eq("id", rating.id).single()

  const dbRating = {
    worker_id: rating.workerId,
    worker_name: rating.workerName,
    month: rating.month,
    production_score: rating.productionScore,
    quality_score: rating.qualityScore,
    discipline_score: rating.disciplineScore,
    overall_score: rating.overallScore,
    notes: rating.notes,
    rated_by: rating.ratedBy,
    rated_by_name: rating.ratedByName,
    updated_at: new Date().toISOString(),
  }

  if (data) {
    // Update
    await supabase.from("worker_performance_ratings").update(dbRating).eq("id", rating.id)
  } else {
    // Insert
    await supabase.from("worker_performance_ratings").insert([{
      ...dbRating,
      created_at: rating.createdAt,
      // id: rating.id // Let Postgres generate UUID
    }])
  }
  dispatchStorageUpdate()
}
export async function deletePerformanceRating(ratingId: string): Promise<void> {
  const { error } = await supabase.from("worker_performance_ratings").delete().eq("id", ratingId)
  if (error) console.error("Error deleting rating:", error)
  else dispatchStorageUpdate()
}

// --- Attendance Records ---

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase.from("attendance_records").select("*")
  if (error) {
    console.error("Error fetching attendance records:", error)
    return []
  }
  return (data || []).map((record: any) => ({
    id: record.id,
    workerId: record.worker_id,
    workerName: record.worker_name,
    date: record.date,
    status: record.status,
    taskSection: record.task_section,
    rainfallMm: record.rainfall_mm,
    notes: record.notes,
    registeredBy: record.registered_by,
    registeredByName: record.registered_by_name,
    createdAt: record.created_at,
  }))
}

export async function saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  const dbRecord = {
    id: record.id,
    worker_id: record.workerId,
    worker_name: record.workerName,
    date: record.date,
    status: record.status,
    task_section: record.taskSection,
    rainfall_mm: record.rainfallMm,
    notes: record.notes,
    registered_by: record.registeredBy,
    registered_by_name: record.registeredByName,
    created_at: record.createdAt,
  }
  const { error } = await supabase.from("attendance_records").insert([dbRecord])
  if (error) console.error("Error adding attendance record:", error)
  else dispatchStorageUpdate()
}

export async function deleteAttendanceRecord(id: string): Promise<void> {
  const { error } = await supabase.from("attendance_records").delete().eq("id", id)
  if (error) console.error("Error deleting attendance record:", error)
  else dispatchStorageUpdate()
}

export async function getAttendanceByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase.from("attendance_records")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error fetching attendance by date:", error)
    return []
  }
  return data || []
}

export async function getAttendanceByWorker(workerId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase.from("attendance_records").select("*").eq("worker_id", workerId)
  if (error) {
    console.error("Error fetching attendance by worker:", error)
    return []
  }
  return data || []
}

// --- Utility Functions ---

export async function canTapSection(
  taskType: string,
  workerId: string,
): Promise<{ canTap: boolean; nextAvailableDate?: string; daysRemaining?: number }> {
  // Ideally this logic should run server-side or via a complex query to avoid fetching all tasks
  // For MVP phase, we will fetch recent tasks for this worker
  // TODO: Optimize this query
  const { data: tasks } = await supabase
    .from("tasks")
    .select("last_tapping_date, status")
    .eq("worker_id", workerId)
    .eq("task_type", taskType)
    .eq("status", "completed")
    .not("last_tapping_date", "is", null)
    .order("last_tapping_date", { ascending: false })
    .limit(1)

  if (!tasks || tasks.length === 0) {
    return { canTap: true }
  }

  const lastTask = tasks[0]
  if (!lastTask.last_tapping_date) return { canTap: true } // Should be caught by query but double check

  const lastTappingDate = new Date(lastTask.last_tapping_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  lastTappingDate.setHours(0, 0, 0, 0)

  const daysSinceLastTapping = Math.floor((today.getTime() - lastTappingDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceLastTapping >= 4) {
    return { canTap: true }
  }

  const daysRemaining = 4 - daysSinceLastTapping
  const nextAvailableDate = new Date(lastTappingDate)
  nextAvailableDate.setDate(nextAvailableDate.getDate() + 4)

  return {
    canTap: false,
    nextAvailableDate: nextAvailableDate.toISOString().split("T")[0],
    daysRemaining,
  }
}

// --- Rainfall Records ---

export async function getRainfallRecords(): Promise<RainfallRecord[]> {
  const { data, error } = await supabase
    .from("rainfall_records")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching rainfall records:", error)
    return []
  }

  return (data || []).map((record: any) => ({
    id: record.id,
    date: record.date,
    amountMm: record.amount_mm,
    notes: record.notes,
    registeredBy: record.registered_by,
    registeredByName: record.registered_by_name,
    createdAt: record.created_at,
  }))
}

export async function saveRainfallRecord(record: Omit<RainfallRecord, "id" | "createdAt">): Promise<void> {
  const dbRecord = {
    date: record.date,
    amount_mm: record.amountMm,
    notes: record.notes,
    registered_by: record.registeredBy,
    registered_by_name: record.registeredByName,
  }

  const { error } = await supabase.from("rainfall_records").insert([dbRecord])
  if (error) {
    console.error("Error saving rainfall record:", error)
    throw error
  }
  dispatchStorageUpdate()
}

export async function deleteRainfallRecord(id: string): Promise<void> {
  const { error } = await supabase.from("rainfall_records").delete().eq("id", id)
  if (error) {
    console.error("Error deleting rainfall record:", error)
    throw error
  }
  dispatchStorageUpdate()
}
