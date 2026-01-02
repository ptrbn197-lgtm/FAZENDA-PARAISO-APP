-- Create rainfall_records table
CREATE TABLE IF NOT EXISTS public.rainfall_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    amount_mm NUMERIC NOT NULL,
    notes TEXT,
    registered_by TEXT NOT NULL,
    registered_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.rainfall_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "All access for authenticated users" ON public.rainfall_records
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Read access for all" ON public.rainfall_records
    FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rainfall_date ON public.rainfall_records(date);
