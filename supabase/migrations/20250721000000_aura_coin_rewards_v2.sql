-- Migration: AuraCoin Rewards v2 (Simplified)
-- Date: 2025-07-21
-- Description: Simplified reward system with 1 AURA per page

-- Step 1: Add missing columns to reading_logs table
ALTER TABLE public.reading_logs 
ADD COLUMN IF NOT EXISTS reward_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'rewarded'));

-- Step 2: Create pending_rewards table
CREATE TABLE IF NOT EXISTS public.pending_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  book_title TEXT NOT NULL,
  book_pages INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_rewards_user_id ON public.pending_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_status ON public.pending_rewards(status);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_created_at ON public.pending_rewards(created_at);

-- Step 4: Set up Row Level Security (RLS)
ALTER TABLE public.pending_rewards ENABLE ROW LEVEL SECURITY;

-- Users can only see their own pending rewards
CREATE POLICY "Users can view own pending rewards" ON public.pending_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert (via triggers)
CREATE POLICY "Authenticated users can insert pending rewards" ON public.pending_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only system/admin can update (for processing)
CREATE POLICY "System can update pending rewards" ON public.pending_rewards
  FOR UPDATE USING (true); 