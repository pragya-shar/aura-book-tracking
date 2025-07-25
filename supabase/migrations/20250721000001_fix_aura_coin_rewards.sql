-- Migration: Fix AuraCoin Rewards v2 Issues
-- Date: 2025-07-21
-- Description: Fix issues in the previous migration

-- Step 1: Add unique constraint to prevent duplicate rewards for same user+book
ALTER TABLE public.pending_rewards 
ADD CONSTRAINT unique_user_book_reward UNIQUE (user_id, book_id);

-- Step 2: Add foreign key constraint for wallet_address (simplified)
-- Note: We'll validate wallet_address exists in user_profiles via application logic
-- since user_profiles doesn't have a composite unique constraint

-- Step 3: Add composite index for better performance
CREATE INDEX IF NOT EXISTS idx_pending_rewards_user_book ON public.pending_rewards(user_id, book_id);

-- Step 4: Add check constraint to ensure reward_amount is positive
ALTER TABLE public.pending_rewards 
ADD CONSTRAINT check_positive_reward_amount CHECK (reward_amount > 0);

-- Step 5: Add check constraint to ensure book_pages is positive
ALTER TABLE public.pending_rewards 
ADD CONSTRAINT check_positive_book_pages CHECK (book_pages > 0);

-- Step 6: Add check constraint to ensure wallet_address is not empty
ALTER TABLE public.pending_rewards 
ADD CONSTRAINT check_wallet_address_not_empty CHECK (wallet_address != '');

-- Step 7: Add comment for documentation
COMMENT ON TABLE public.pending_rewards IS 'Stores pending AuraCoin rewards for completed books (1 AURA per page)';
COMMENT ON COLUMN public.pending_rewards.reward_amount IS 'Reward amount in AURA coins (1 per page)';
COMMENT ON COLUMN public.pending_rewards.status IS 'Reward processing status: pending, processing, completed, failed'; 