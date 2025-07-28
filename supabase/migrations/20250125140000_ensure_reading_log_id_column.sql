-- Ensure reading_log_id column exists in pending_rewards
-- Migration: 20250125140000_ensure_reading_log_id_column.sql
-- Date: 2025-01-25 14:00:00
-- Description: Add reading_log_id column to pending_rewards if it doesn't exist

-- Add the missing column if it doesn't exist
ALTER TABLE public.pending_rewards 
ADD COLUMN IF NOT EXISTS reading_log_id UUID REFERENCES public.reading_logs(id) ON DELETE SET NULL;

-- Ensure the column is properly indexed for performance
CREATE INDEX IF NOT EXISTS idx_pending_rewards_reading_log_id 
ON public.pending_rewards(reading_log_id);

-- Add comment for clarity
COMMENT ON COLUMN public.pending_rewards.reading_log_id IS 'Reference to the reading log that triggered this reward'; 