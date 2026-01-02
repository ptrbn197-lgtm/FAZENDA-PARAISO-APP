-- Add rainfall_mm column to attendance_records
ALTER TABLE public.attendance_records 
ADD COLUMN IF NOT EXISTS rainfall_mm numeric;

-- Comment on column
COMMENT ON COLUMN public.attendance_records.rainfall_mm IS 'Rainfall in millimeters when status is falta-chuva';
