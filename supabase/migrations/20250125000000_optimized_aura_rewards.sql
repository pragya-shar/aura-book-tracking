-- Optimized AuraCoin Rewards System
-- Migration: 20250125000000_optimized_aura_rewards.sql
-- Date: 2025-01-25
-- Description: Enhanced database schema for automated reward detection and processing

-- Step 1: Add reward tracking columns to reading_logs table
ALTER TABLE public.reading_logs 
ADD COLUMN IF NOT EXISTS reward_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reward_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Create pending_rewards table with real-time optimization
CREATE TABLE IF NOT EXISTS public.pending_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  reading_log_id UUID REFERENCES public.reading_logs(id) ON DELETE SET NULL,
  wallet_address TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  book_title TEXT NOT NULL,
  book_pages INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Prevent duplicate rewards for same user/book combination
  UNIQUE(user_id, book_id)
);

-- Step 3: Create optimized indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_rewards_user_status ON public.pending_rewards(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_created_at ON public.pending_rewards(created_at);
CREATE INDEX IF NOT EXISTS idx_reading_logs_reward_created ON public.reading_logs(reward_created);

-- Step 4: Set up Row Level Security (RLS) for pending_rewards
ALTER TABLE public.pending_rewards ENABLE ROW LEVEL SECURITY;

-- Users can only view their own pending rewards
CREATE POLICY "Users view own pending rewards" ON public.pending_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can insert rewards (via triggers/functions)
CREATE POLICY "Authenticated users insert rewards" ON public.pending_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System can update rewards (for admin processing)
CREATE POLICY "System updates rewards" ON public.pending_rewards
  FOR UPDATE USING (true);

-- Step 5: Add helpful comments for future reference
COMMENT ON TABLE public.pending_rewards IS 'Stores pending AuraCoin rewards for completed books (1 AURA per page)';
COMMENT ON COLUMN public.pending_rewards.reward_amount IS 'Amount of AURA tokens to be minted (1 per page)';
COMMENT ON COLUMN public.pending_rewards.status IS 'Processing status: pending -> processing -> completed/failed';
COMMENT ON COLUMN public.reading_logs.reward_created IS 'Flag to prevent duplicate reward creation';
COMMENT ON COLUMN public.reading_logs.completed_at IS 'Timestamp when book was completed (100% progress)';

-- Step 6: Grant necessary permissions
GRANT SELECT, INSERT ON public.pending_rewards TO authenticated;
GRANT UPDATE (reward_created, reward_amount, completed_at) ON public.reading_logs TO authenticated; 