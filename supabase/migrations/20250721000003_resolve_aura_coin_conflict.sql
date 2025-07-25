-- Migration: Resolve AuraCoin Reward System Conflict
-- Date: 2025-07-21
-- Description: Resolve conflict between old and new AuraCoin reward systems

-- Step 1: Migrate data from old system to new system (if any exists)
-- This ensures no data is lost during the transition
INSERT INTO public.pending_rewards (
  user_id,
  book_id,
  wallet_address,
  reward_amount,
  book_title,
  book_pages,
  completed_at,
  created_at,
  processed_at,
  transaction_hash,
  status
)
SELECT 
  acr.user_id,
  acr.book_id,
  acr.wallet_address,
  acr.reward_amount,
  acr.book_title,
  acr.book_pages,
  acr.completed_at,
  acr.created_at,
  acr.rewarded_at,
  acr.transaction_hash,
  CASE 
    WHEN acr.transaction_hash IS NOT NULL THEN 'completed'
    ELSE 'pending'
  END
FROM public.aura_coin_rewards acr
WHERE NOT EXISTS (
  SELECT 1 FROM public.pending_rewards pr 
  WHERE pr.user_id = acr.user_id AND pr.book_id = acr.book_id
);

-- Step 2: Update reading_logs to use new status system
-- Convert old 'rewarded' boolean to new status system
UPDATE public.reading_logs 
SET 
  status = CASE 
    WHEN rewarded = TRUE THEN 'rewarded'
    WHEN reward_amount > 0 THEN 'completed'
    ELSE 'in_progress'
  END,
  reward_amount = COALESCE(reward_amount, 0)
WHERE status IS NULL OR status = '';

-- Step 3: Drop old aura_coin_rewards table (after data migration)
DROP TABLE IF EXISTS public.aura_coin_rewards CASCADE;

-- Step 4: Remove old columns from reading_logs that are no longer needed
ALTER TABLE public.reading_logs 
DROP COLUMN IF EXISTS rewarded,
DROP COLUMN IF EXISTS rewarded_at;

-- Step 5: Remove old columns from books that are no longer needed
-- Note: We keep 'pages' column as it might be used elsewhere
-- But we remove 'difficulty' as it's not part of the simplified system
ALTER TABLE public.books 
DROP COLUMN IF EXISTS difficulty;

-- Step 6: Drop old indexes that are no longer needed
DROP INDEX IF EXISTS idx_reading_logs_rewarded;
DROP INDEX IF EXISTS idx_reading_logs_rewarded_at;
DROP INDEX IF EXISTS idx_books_difficulty;

-- Step 7: Add comment to clarify the current system
COMMENT ON TABLE public.pending_rewards IS 'Current AuraCoin rewards system: 1 AURA per page, simplified approach';
COMMENT ON COLUMN public.reading_logs.status IS 'Reading status: in_progress, completed, rewarded';
COMMENT ON COLUMN public.reading_logs.reward_amount IS 'AuraCoin reward amount (1 per page)';

-- Step 8: Verify data integrity
-- Create a function to check for any orphaned records
CREATE OR REPLACE FUNCTION verify_aura_coin_integrity()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check for orphaned pending_rewards
  RETURN QUERY
  SELECT 
    'Orphaned pending_rewards'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'
      ELSE 'WARNING: ' || COUNT(*) || ' orphaned records'
    END::TEXT,
    'Records without valid user_id or book_id'::TEXT
  FROM public.pending_rewards pr
  LEFT JOIN auth.users u ON pr.user_id = u.id
  LEFT JOIN public.books b ON pr.book_id = b.id
  WHERE u.id IS NULL OR b.id IS NULL;
  
  -- Check for inconsistent reward amounts
  RETURN QUERY
  SELECT 
    'Reward amount consistency'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'
      ELSE 'WARNING: ' || COUNT(*) || ' inconsistent records'
    END::TEXT,
    'Reward amount should equal book pages'::TEXT
  FROM public.pending_rewards pr
  JOIN public.books b ON pr.book_id = b.id
  WHERE pr.reward_amount != b.page_count;
  
  -- Check for duplicate rewards
  RETURN QUERY
  SELECT 
    'Duplicate rewards'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'
      ELSE 'WARNING: ' || COUNT(*) || ' duplicates found'
    END::TEXT,
    'Multiple rewards for same user+book combination'::TEXT
  FROM (
    SELECT user_id, book_id, COUNT(*)
    FROM public.pending_rewards
    GROUP BY user_id, book_id
    HAVING COUNT(*) > 1
  ) duplicates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant permissions for integrity check
GRANT EXECUTE ON FUNCTION verify_aura_coin_integrity() TO service_role;

-- Step 10: Add comment for the integrity function
COMMENT ON FUNCTION verify_aura_coin_integrity() IS 'Verifies data integrity of the AuraCoin rewards system'; 