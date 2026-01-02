-- ==============================================
-- SCHEMA COMPLETO DO SUPABASE
-- Sistema de Gerenciamento do Seringal Fazenda Paraíso
-- ==============================================

-- Habilitar extensão UUID (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- TABELA: users
-- Gerenciamento de usuários do sistema
-- ==============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('worker', 'inspector', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage users" ON public.users
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- TABELA: tasks
-- Tarefas de sangria dos trabalhadores
-- ==============================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    date DATE NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('A', 'B', 'C', 'D')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'inspected')),
    production_kg NUMERIC DEFAULT 0,
    inspection_id UUID,
    last_tapping_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.tasks
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_tasks_worker_id ON public.tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.tasks(date);

-- ==============================================
-- TABELA: inspections
-- Inspeções de qualidade das tarefas
-- ==============================================
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID NOT NULL,
    inspector_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    date DATE NOT NULL,
    angle INTEGER NOT NULL CHECK (angle >= 1 AND angle <= 5),
    depth INTEGER NOT NULL CHECK (depth >= 1 AND depth <= 5),
    injuries INTEGER NOT NULL CHECK (injuries >= 1 AND injuries <= 5),
    spout_cleanliness INTEGER NOT NULL CHECK (spout_cleanliness >= 1 AND spout_cleanliness <= 5),
    overall_score NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.inspections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_inspections_task_id ON public.inspections(task_id);

-- ==============================================
-- TABELA: production_records
-- Registros de produção de látex
-- ==============================================
CREATE TABLE IF NOT EXISTS public.production_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    date DATE NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('A', 'B', 'C', 'D')),
    production_kg NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.production_records
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_production_worker_id ON public.production_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_production_date ON public.production_records(date);

-- ==============================================
-- TABELA: monthly_weighings
-- Pesagens mensais de produção
-- ==============================================
CREATE TABLE IF NOT EXISTS public.monthly_weighings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    month TEXT NOT NULL, -- formato: "2025-01"
    production_kg NUMERIC NOT NULL,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.monthly_weighings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.monthly_weighings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_monthly_weighings_worker_id ON public.monthly_weighings(worker_id);
CREATE INDEX IF NOT EXISTS idx_monthly_weighings_month ON public.monthly_weighings(month);

-- ==============================================
-- TABELA: worker_tree_inventory
-- Inventário de árvores por trabalhador
-- ==============================================
CREATE TABLE IF NOT EXISTS public.worker_tree_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_name TEXT NOT NULL,
    sections JSONB NOT NULL, -- Array de {section: string, treeCount: number}
    total_trees INTEGER NOT NULL,
    extra_trees INTEGER,
    code TEXT NOT NULL, -- A, B, C, D, E, F, G
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.worker_tree_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.worker_tree_inventory
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- TABELA: stimulation_records
-- Registros de estimulação das árvores
-- ==============================================
CREATE TABLE IF NOT EXISTS public.stimulation_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_section TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    application_date DATE NOT NULL,
    notes TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.stimulation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.stimulation_records
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_stimulation_date ON public.stimulation_records(application_date);

-- ==============================================
-- TABELA: pest_control_records
-- Registros de controle de pragas e doenças
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pest_control_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_section TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    pest_type TEXT NOT NULL CHECK (pest_type IN ('formigas', 'fungos', 'insetos', 'doencas', 'ervas-daninhas', 'outro')),
    pest_species TEXT,
    control_method TEXT NOT NULL,
    control_type TEXT NOT NULL CHECK (control_type IN ('cultural', 'biologico', 'quimico', 'integrado')),
    product_used TEXT NOT NULL,
    application_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'em-tratamento', 'controlado', 'monitoramento')),
    severity TEXT NOT NULL CHECK (severity IN ('baixa', 'media', 'alta')),
    affected_area TEXT NOT NULL,
    affected_trees_count INTEGER,
    affected_hectares NUMERIC,
    notes TEXT,
    epi_used BOOLEAN,
    dosage_used TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pest_control_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.pest_control_records
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_pest_control_date ON public.pest_control_records(application_date);
CREATE INDEX IF NOT EXISTS idx_pest_control_status ON public.pest_control_records(status);

-- ==============================================
-- TABELA: pest_control_area_maps
-- Mapeamento de áreas para controle de pragas
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pest_control_area_maps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_section TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    plant_age INTEGER NOT NULL,
    total_trees INTEGER NOT NULL,
    hectares NUMERIC NOT NULL,
    pest_history TEXT[], -- Array de strings
    last_inspection_date DATE,
    soil_type TEXT,
    irrigation_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pest_control_area_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.pest_control_area_maps
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- TABELA: pest_inspection_schedules
-- Agendamento de inspeções de pragas
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pest_inspection_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_section TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('semanal', 'quinzenal', 'mensal')),
    inspector_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('agendada', 'realizada', 'cancelada')),
    completed_date DATE,
    findings TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pest_inspection_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.pest_inspection_schedules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_pest_inspection_date ON public.pest_inspection_schedules(scheduled_date);

-- ==============================================
-- TABELA: pest_inspection_checklists
-- Checklists de inspeção de pragas
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pest_inspection_checklists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inspection_schedule_id UUID NOT NULL,
    task_section TEXT NOT NULL,
    inspection_date DATE NOT NULL,
    inspector_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    pest_presence BOOLEAN NOT NULL,
    pest_severity TEXT CHECK (pest_severity IN ('baixa', 'media', 'alta')),
    control_effectiveness TEXT NOT NULL CHECK (control_effectiveness IN ('excelente', 'boa', 'regular', 'ruim')),
    epi_compliance BOOLEAN NOT NULL,
    product_application BOOLEAN NOT NULL,
    application_record BOOLEAN NOT NULL,
    treatment_area TEXT,
    product_used TEXT,
    dosage TEXT,
    observations TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pest_inspection_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.pest_inspection_checklists
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- TABELA: pest_control_trainings
-- Registros de treinamentos sobre controle de pragas
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pest_control_trainings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    training_date DATE NOT NULL,
    training_topic TEXT NOT NULL,
    trainer TEXT NOT NULL,
    participants TEXT[] NOT NULL, -- Array de worker IDs
    participant_names TEXT[] NOT NULL,
    duration NUMERIC NOT NULL, -- horas
    topics TEXT[] NOT NULL,
    certificate BOOLEAN,
    notes TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pest_control_trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.pest_control_trainings
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- TABELA: worker_performance_ratings
-- Avaliações de desempenho dos trabalhadores
-- ==============================================
CREATE TABLE IF NOT EXISTS public.worker_performance_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    month TEXT NOT NULL, -- formato: "2025-01"
    production_score NUMERIC NOT NULL CHECK (production_score >= 0 AND production_score <= 10),
    quality_score NUMERIC NOT NULL CHECK (quality_score >= 0 AND quality_score <= 10),
    discipline_score NUMERIC NOT NULL CHECK (discipline_score >= 0 AND discipline_score <= 10),
    overall_score NUMERIC NOT NULL,
    notes TEXT,
    rated_by TEXT NOT NULL,
    rated_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.worker_performance_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.worker_performance_ratings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_performance_worker_id ON public.worker_performance_ratings(worker_id);
CREATE INDEX IF NOT EXISTS idx_performance_month ON public.worker_performance_ratings(month);

-- ==============================================
-- TABELA: attendance_records
-- Registros de presença e faltas dos trabalhadores
-- ==============================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sangria-realizada', 'falta', 'falta-chuva', 'tarefa-recuperada')),
    task_section TEXT,
    rainfall_mm NUMERIC,
    notes TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.attendance_records
    FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_attendance_worker_id ON public.attendance_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);

COMMENT ON COLUMN public.attendance_records.rainfall_mm IS 'Rainfall in millimeters when status is falta-chuva';

-- ==============================================
-- TABELA: rainfall_records
-- Registros de precipitação pluviométrica
-- ==============================================
CREATE TABLE IF NOT EXISTS public.rainfall_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    amount_mm NUMERIC NOT NULL,
    notes TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rainfall_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All access for authenticated users" ON public.rainfall_records
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Read access for all" ON public.rainfall_records
    FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_rainfall_date ON public.rainfall_records(date);

-- ==============================================
-- COMENTÁRIOS FINAIS
-- ==============================================

COMMENT ON TABLE public.users IS 'Usuários do sistema (trabalhadores, inspetores, administradores)';
COMMENT ON TABLE public.tasks IS 'Tarefas de sangria dos trabalhadores';
COMMENT ON TABLE public.inspections IS 'Inspeções de qualidade das tarefas de sangria';
COMMENT ON TABLE public.production_records IS 'Registros históricos de produção de látex';
COMMENT ON TABLE public.monthly_weighings IS 'Pesagens mensais de produção';
COMMENT ON TABLE public.worker_tree_inventory IS 'Inventário de árvores por trabalhador';
COMMENT ON TABLE public.stimulation_records IS 'Registros de estimulação das seringueiras';
COMMENT ON TABLE public.pest_control_records IS 'Registros de controle de pragas e doenças';
COMMENT ON TABLE public.pest_control_area_maps IS 'Mapeamento de áreas com informações para controle de pragas';
COMMENT ON TABLE public.pest_inspection_schedules IS 'Agendamento de inspeções de pragas';
COMMENT ON TABLE public.pest_inspection_checklists IS 'Checklists de inspeção de pragas';
COMMENT ON TABLE public.pest_control_trainings IS 'Registros de treinamentos sobre controle de pragas';
COMMENT ON TABLE public.worker_performance_ratings IS 'Avaliações de desempenho mensal dos trabalhadores';
COMMENT ON TABLE public.attendance_records IS 'Registros de presença, faltas e recuperações';
COMMENT ON TABLE public.rainfall_records IS 'Registros de precipitação pluviométrica';
