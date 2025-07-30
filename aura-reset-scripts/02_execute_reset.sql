-- ==============================================
-- AURA REWARDS RESET EXECUTION
-- Run this in your Supabase SQL Editor AFTER reviewing the analysis
-- ==============================================

-- Step 1: DRY RUN - See what would be changed (run this first!)
SELECT 
  '=== DRY RUN RESULTS ===' as section,
  action_taken,
  reward_id,
  book_title,
  old_status,
  new_status,
  success
FROM reset_problematic_rewards(true)  -- true = dry run
ORDER BY book_title;

-- Step 2: ACTUAL RESET (uncomment when ready to execute)
-- ⚠️ IMPORTANT: Only uncomment and run this after reviewing the dry run results!

/*
SELECT 
  '=== ACTUAL RESET RESULTS ===' as section,
  action_taken,
  reward_id,
  book_title,  
  old_status,
  new_status,
  success
FROM reset_problematic_rewards(false)  -- false = actual execution
ORDER BY book_title;
*/