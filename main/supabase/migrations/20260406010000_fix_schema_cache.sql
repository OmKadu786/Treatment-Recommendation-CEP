-- 20260406010000_fix_schema_cache.sql
-- Fixes the schema mismatch between the Edge Function and the Master Reset table

ALTER TABLE public.treatment_recommendations 
ADD COLUMN IF NOT EXISTS medical_disclaimer TEXT,
ADD COLUMN IF NOT EXISTS clinical_consultation_required BOOLEAN,
ADD COLUMN IF NOT EXISTS recommended_pathways JSONB;
