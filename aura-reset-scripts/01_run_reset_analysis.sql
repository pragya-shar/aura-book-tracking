-- ==============================================
-- AURA REWARDS RESET ANALYSIS
-- Run this in your Supabase SQL Editor
-- ==============================================

-- Step 1: Current reward status overview
SELECT 
  '=== CURRENT REWARD STATUS ===' as section,
  status_summary,
  count_rewards,
  total_amount,
  min_processed_at,
  max_processed_at
FROM analyze_current_rewards();

-- Step 2: Detailed view of what will be reset vs kept
SELECT 
  '=== REWARDS TO RESET/KEEP ===' as section,
  reward_id,
  book_title,
  reward_amount,
  processed_at,
  CASE 
    WHEN should_reset THEN '❌ WILL BE RESET'
    ELSE '✅ WILL BE KEPT'
  END as action,
  reset_reason
FROM identify_rewards_to_reset()
ORDER BY processed_at DESC NULLS LAST;

-- Step 3: Impact summary
WITH reset_analysis AS (
  SELECT 
    COUNT(*) FILTER (WHERE should_reset = true) as rewards_to_reset,
    COUNT(*) FILTER (WHERE should_reset = false AND reset_reason LIKE '%Recent correctly%') as rewards_to_keep,
    SUM(reward_amount) FILTER (WHERE should_reset = true) as aura_to_reset,
    SUM(reward_amount) FILTER (WHERE should_reset = false AND reset_reason LIKE '%Recent correctly%') as aura_to_keep
  FROM identify_rewards_to_reset()
)
SELECT 
  '=== RESET IMPACT SUMMARY ===' as section,
  rewards_to_reset,
  rewards_to_keep,
  aura_to_reset,
  aura_to_keep,
  (aura_to_reset + aura_to_keep) as total_aura_currently_completed
FROM reset_analysis;