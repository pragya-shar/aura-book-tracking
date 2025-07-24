-- Add AuraCoin rewards system
-- This migration adds support for tracking AuraCoin rewards for book completions

-- Add rewarded column to reading_logs table
ALTER TABLE public.reading_logs 
ADD COLUMN IF NOT EXISTS rewarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rewarded_at TIMESTAMP WITH TIME ZONE;

-- Add pages and difficulty columns to books table
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS pages INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Create aura_coin_rewards table
CREATE TABLE IF NOT EXISTS public.aura_coin_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  book_title TEXT NOT NULL,
  book_pages INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  rewarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on aura_coin_rewards
ALTER TABLE public.aura_coin_rewards ENABLE ROW LEVEL SECURITY;

-- Policies for aura_coin_rewards
CREATE POLICY "Users can view their own rewards" ON public.aura_coin_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own rewards" ON public.aura_coin_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aura_coin_rewards_user_id ON public.aura_coin_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_aura_coin_rewards_book_id ON public.aura_coin_rewards(book_id);
CREATE INDEX IF NOT EXISTS idx_aura_coin_rewards_wallet_address ON public.aura_coin_rewards(wallet_address);
CREATE INDEX IF NOT EXISTS idx_aura_coin_rewards_rewarded_at ON public.aura_coin_rewards(rewarded_at);

-- Add indexes for reading_logs
CREATE INDEX IF NOT EXISTS idx_reading_logs_rewarded ON public.reading_logs(rewarded);
CREATE INDEX IF NOT EXISTS idx_reading_logs_rewarded_at ON public.reading_logs(rewarded_at);

-- Add indexes for books
CREATE INDEX IF NOT EXISTS idx_books_pages ON public.books(pages);
CREATE INDEX IF NOT EXISTS idx_books_difficulty ON public.books(difficulty); 