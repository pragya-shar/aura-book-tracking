-- ==============================================
-- VERIFY RESET RESULTS
-- Run this after executing the reset
-- ==============================================

SELECT 
  '=== VERIFICATION RESULTS ===' as section,
  summary_item,
  count_value,
  details
FROM verify_reset_results()
ORDER BY summary_item;

-- Additional verification: Show the 2 rewards that should remain completed
SELECT 
  '=== REMAINING COMPLETED REWARDS ===' as section,
  id,
  book_title,
  reward_amount,
  processed_at,
  transaction_hash IS NOT NULL as has_transaction
FROM pending_rewards 
WHERE status = 'completed'
ORDER BY processed_at DESC;

-- Show first few pending rewards (should be the reset ones)
SELECT 
  '=== SAMPLE PENDING REWARDS ===' as section,
  id,
  book_title,
  reward_amount,
  created_at,
  'Ready for re-processing' as note
FROM pending_rewards 
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;