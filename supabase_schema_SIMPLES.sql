-- ==============================================
-- SCHEMA SIMPLIFICADO - EXECUTE POR PARTES
-- ==============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- PARTE 1: TABELAS PRINCIPAIS
-- ==============================================

-- Tabela: users
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('worker', 'inspector', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: tasks
DROP TABLE IF EXISTS public.tasks CASCADE;
CREATE TABLE public.tasks (
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

-- Tabela: inspections
DROP TABLE IF EXISTS public.inspections CASCADE;
CREATE TABLE public.inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID,
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

-- Tabela: production_records
DROP TABLE IF EXISTS public.production_records CASCADE;
CREATE TABLE public.production_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    date DATE NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('A', 'B', 'C', 'D')),
    production_kg NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: monthly_weighings
DROP TABLE IF EXISTS public.monthly_weighings CASCADE;
CREATE TABLE public.monthly_weighings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    month TEXT NOT NULL,
    production_kg NUMERIC NOT NULL,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: worker_tree_inventory
DROP TABLE IF EXISTS public.worker_tree_inventory CASCADE;
CREATE TABLE public.worker_tree_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_name TEXT NOT NULL,
    sections JSONB NOT NULL,
    total_trees INTEGER NOT NULL,
    extra_trees INTEGER,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: stimulation_records
DROP TABLE IF EXISTS public.stimulation_records CASCADE;
CREATE TABLE public.stimulation_records (
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

-- Tabela: attendance_records
DROP TABLE IF EXISTS public.attendance_records CASCADE;
CREATE TABLE public.attendance_records (
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

-- Tabela: rainfall_records
DROP TABLE IF EXISTS public.rainfall_records CASCADE;
CREATE TABLE public.rainfall_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    amount_mm NUMERIC NOT NULL,
    notes TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: worker_performance_ratings
DROP TABLE IF EXISTS public.worker_performance_ratings CASCADE;
CREATE TABLE public.worker_performance_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    month TEXT NOT NULL,
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

-- ==============================================
-- PARTE 2: CONTROLE DE PRAGAS
-- ==============================================

-- Tabela: pest_control_records
DROP TABLE IF EXISTS public.pest_control_records CASCADE;
CREATE TABLE public.pest_control_records (
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

-- Tabela: pest_control_area_maps
DROP TABLE IF EXISTS public.pest_control_area_maps CASCADE;
CREATE TABLE public.pest_control_area_maps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_section TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    plant_age INTEGER NOT NULL,
    total_trees INTEGER NOT NULL,
    hectares NUMERIC NOT NULL,
    pest_history TEXT[],
    last_inspection_date DATE,
    soil_type TEXT,
    irrigation_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: pest_inspection_schedules
DROP TABLE IF EXISTS public.pest_inspection_schedules CASCADE;
CREATE TABLE public.pest_inspection_schedules (
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

-- Tabela: pest_inspection_checklists
DROP TABLE IF EXISTS public.pest_inspection_checklists CASCADE;
CREATE TABLE public.pest_inspection_checklists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inspection_schedule_id UUID,
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

-- Tabela: pest_control_trainings
DROP TABLE IF EXISTS public.pest_control_trainings CASCADE;
CREATE TABLE public.pest_control_trainings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    training_date DATE NOT NULL,
    training_topic TEXT NOT NULL,
    trainer TEXT NOT NULL,
    participants TEXT[] NOT NULL,
    participant_names TEXT[] NOT NULL,
    duration NUMERIC NOT NULL,
    topics TEXT[] NOT NULL,
    certificate BOOLEAN,
    notes TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================
-- PARTE 3: RLS (Row Level Security)
-- ==============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_tree_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stimulation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rainfall_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_performance_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_control_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_control_area_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_inspection_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_control_trainings ENABLE ROW LEVEL SECURITY;

-- Políticas (DROP IF EXISTS para evitar erros)
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
CREATE POLICY "Users can read all users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can manage users" ON public.users FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on tasks" ON public.tasks;
CREATE POLICY "All access for authenticated users on tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on inspections" ON public.inspections;
CREATE POLICY "All access for authenticated users on inspections" ON public.inspections FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on production" ON public.production_records;
CREATE POLICY "All access for authenticated users on production" ON public.production_records FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on weighings" ON public.monthly_weighings;
CREATE POLICY "All access for authenticated users on weighings" ON public.monthly_weighings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on inventory" ON public.worker_tree_inventory;
CREATE POLICY "All access for authenticated users on inventory" ON public.worker_tree_inventory FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on stimulation" ON public.stimulation_records;
CREATE POLICY "All access for authenticated users on stimulation" ON public.stimulation_records FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on attendance" ON public.attendance_records;
CREATE POLICY "All access for authenticated users on attendance" ON public.attendance_records FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on rainfall" ON public.rainfall_records;
CREATE POLICY "All access for authenticated users on rainfall" ON public.rainfall_records FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Read access for all on rainfall" ON public.rainfall_records;
CREATE POLICY "Read access for all on rainfall" ON public.rainfall_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "All access for authenticated users on performance" ON public.worker_performance_ratings;
CREATE POLICY "All access for authenticated users on performance" ON public.worker_performance_ratings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on pest_control" ON public.pest_control_records;
CREATE POLICY "All access for authenticated users on pest_control" ON public.pest_control_records FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on pest_maps" ON public.pest_control_area_maps;
CREATE POLICY "All access for authenticated users on pest_maps" ON public.pest_control_area_maps FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on pest_schedules" ON public.pest_inspection_schedules;
CREATE POLICY "All access for authenticated users on pest_schedules" ON public.pest_inspection_schedules FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on pest_checklists" ON public.pest_inspection_checklists;
CREATE POLICY "All access for authenticated users on pest_checklists" ON public.pest_inspection_checklists FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All access for authenticated users on pest_trainings" ON public.pest_control_trainings;
CREATE POLICY "All access for authenticated users on pest_trainings" ON public.pest_control_trainings FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- PARTE 4: ÍNDICES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_tasks_worker_id ON public.tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.tasks(date);
CREATE INDEX IF NOT EXISTS idx_inspections_task_id ON public.inspections(task_id);
CREATE INDEX IF NOT EXISTS idx_production_worker_id ON public.production_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_production_date ON public.production_records(date);
CREATE INDEX IF NOT EXISTS idx_monthly_weighings_worker_id ON public.monthly_weighings(worker_id);
CREATE INDEX IF NOT EXISTS idx_monthly_weighings_month ON public.monthly_weighings(month);
CREATE INDEX IF NOT EXISTS idx_stimulation_date ON public.stimulation_records(application_date);
CREATE INDEX IF NOT EXISTS idx_attendance_worker_id ON public.attendance_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_rainfall_date ON public.rainfall_records(date);
CREATE INDEX IF NOT EXISTS idx_performance_worker_id ON public.worker_performance_ratings(worker_id);
CREATE INDEX IF NOT EXISTS idx_performance_month ON public.worker_performance_ratings(month);
CREATE INDEX IF NOT EXISTS idx_pest_control_date ON public.pest_control_records(application_date);
CREATE INDEX IF NOT EXISTS idx_pest_control_status ON public.pest_control_records(status);
CREATE INDEX IF NOT EXISTS idx_pest_inspection_date ON public.pest_inspection_schedules(scheduled_date);
