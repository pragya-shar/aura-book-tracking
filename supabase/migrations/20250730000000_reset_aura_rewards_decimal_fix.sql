-- Migration: Reset AURA Rewards After Decimal Fix
-- Date: 2025-07-30
-- Description: Reset incorrectly processed AURA rewards while preserving correctly processed recent rewards
-- 
-- Background: Early rewards were processed with decimal conversion issues. This migration:
-- 1. Identifies rewards processed before the decimal fix (likely before July 30, 2025)
-- 2. Resets problematic rewards back to 'pending' status
-- 3. Preserves the 2 most recent correctly processed rewards
-- 4. Updates related reading_logs to allow re-processing

-- Step 1: Create backup/analysis functions first
CREATE OR REPLACE FUNCTION analyze_current_rewards()
RETURNS TABLE (
  status_summary TEXT,
  count_rewards BIGINT,
  total_amount BIGINT,
  min_processed_at TIMESTAMP WITH TIME ZONE,
  max_processed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.status::TEXT as status_summary,
    COUNT(*)::BIGINT as count_rewards,
    COALESCE(SUM(pr.reward_amount), 0)::BIGINT as total_amount,
    MIN(pr.processed_at) as min_processed_at,
    MAX(pr.processed_at) as max_processed_at
  FROM public.pending_rewards pr
  GROUP BY pr.status
  ORDER BY pr.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Function to identify rewards that need to be reset
CREATE OR REPLACE FUNCTION identify_rewards_to_reset()
RETURNS TABLE (
  reward_id UUID,
  book_title TEXT,
  reward_amount INTEGER,
  processed_at TIMESTAMP WITH TIME ZONE,
  should_reset BOOLEAN,
  reset_reason TEXT
) AS $$
BEGIN
  -- Note: We'll identify the 2 most recent 'completed' rewards as correctly processed
  -- All other 'completed' rewards will be marked for reset
  RETURN QUERY
  WITH recent_rewards AS (
    SELECT pr.id
    FROM public.pending_rewards pr
    WHERE pr.status = 'completed' 
      AND pr.processed_at IS NOT NULL
      AND pr.transaction_hash IS NOT NULL
    ORDER BY pr.processed_at DESC
    LIMIT 2  -- Keep the 2 most recent correctly processed rewards
  )
  SELECT 
    pr.id as reward_id,
    pr.book_title,
    pr.reward_amount,
    pr.processed_at,
    CASE 
      WHEN pr.status = 'completed' AND pr.id NOT IN (SELECT id FROM recent_rewards) THEN true
      ELSE false
    END as should_reset,
    CASE 
      WHEN pr.status = 'completed' AND pr.id NOT IN (SELECT id FROM recent_rewards) 
        THEN 'Processed before decimal fix - needs reset'
      WHEN pr.status = 'completed' AND pr.id IN (SELECT id FROM recent_rewards)
        THEN 'Recent correctly processed reward - keep as is'
      ELSE 'Not a completed reward - no action needed'
    END as reset_reason
  FROM public.pending_rewards pr
  ORDER BY pr.processed_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Function to safely reset problematic rewards
CREATE OR REPLACE FUNCTION reset_problematic_rewards(dry_run BOOLEAN DEFAULT true)
RETURNS TABLE (
  action_taken TEXT,
  reward_id UUID,
  book_title TEXT,
  old_status TEXT,
  new_status TEXT,
  success BOOLEAN
) AS $$
DECLARE
  reward_record RECORD;
  affected_count INTEGER := 0;
BEGIN
  -- Log the start of the operation
  RAISE NOTICE 'Starting reward reset operation (dry_run: %)', dry_run;
  
  -- Process each reward that needs to be reset
  FOR reward_record IN 
    SELECT r.reward_id, r.book_title, r.should_reset, r.reset_reason
    FROM identify_rewards_to_reset() r
    WHERE r.should_reset = true
  LOOP
    IF dry_run THEN
      -- Dry run: just return what would be done
      RETURN QUERY SELECT 
        'DRY RUN - Would reset'::TEXT as action_taken,
        reward_record.reward_id,
        reward_record.book_title,
        'completed'::TEXT as old_status,
        'pending'::TEXT as new_status,
        true as success;
    ELSE
      -- Actually perform the reset
      BEGIN
        -- Reset the pending_reward back to pending status
        UPDATE public.pending_rewards 
        SET 
          status = 'pending',
          processed_at = NULL,
          transaction_hash = NULL
        WHERE id = reward_record.reward_id;
        
        -- Reset the related reading_log back to completed (from rewarded)
        UPDATE public.reading_logs
        SET status = 'completed'
        WHERE book_id = (
          SELECT book_id FROM public.pending_rewards WHERE id = reward_record.reward_id
        ) 
        AND user_id = (
          SELECT user_id FROM public.pending_rewards WHERE id = reward_record.reward_id
        )
        AND status = 'rewarded';
        
        affected_count := affected_count + 1;
        
        RETURN QUERY SELECT 
          'RESET COMPLETED'::TEXT as action_taken,
          reward_record.reward_id,
          reward_record.book_title,
          'completed'::TEXT as old_status,
          'pending'::TEXT as new_status,
          true as success;
          
      EXCEPTION WHEN others THEN
        RETURN QUERY SELECT 
          'ERROR'::TEXT as action_taken,
          reward_record.reward_id,
          reward_record.book_title,
          'completed'::TEXT as old_status,
          'ERROR'::TEXT as new_status,
          false as success;
      END;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Reset operation completed. Affected rewards: %', affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Function to verify the reset worked correctly
CREATE OR REPLACE FUNCTION verify_reset_results()
RETURNS TABLE (
  summary_item TEXT,
  count_value BIGINT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Count by status
  SELECT 
    'Total Pending Rewards'::TEXT as summary_item,
    COUNT(*)::BIGINT as count_value,
    'Rewards that can be re-processed'::TEXT as details
  FROM public.pending_rewards 
  WHERE status = 'pending'
  
  UNION ALL
  
  SELECT 
    'Total Completed Rewards'::TEXT as summary_item,
    COUNT(*)::BIGINT as count_value,
    'Should be exactly 2 (recent correct rewards)'::TEXT as details
  FROM public.pending_rewards 
  WHERE status = 'completed'
  
  UNION ALL
  
  SELECT 
    'Total AURA Pending'::TEXT as summary_item,
    COALESCE(SUM(reward_amount), 0)::BIGINT as count_value,
    'AURA tokens ready for re-processing'::TEXT as details
  FROM public.pending_rewards 
  WHERE status = 'pending'
  
  UNION ALL
  
  SELECT 
    'Reading Logs - Completed Status'::TEXT as summary_item,
    COUNT(*)::BIGINT as count_value,
    'Books ready for reward re-processing'::TEXT as details
  FROM public.reading_logs 
  WHERE status = 'completed'
  
  UNION ALL
  
  SELECT 
    'Reading Logs - Rewarded Status'::TEXT as summary_item,
    COUNT(*)::BIGINT as count_value,
    'Books with successful rewards (should be 2)'::TEXT as details
  FROM public.reading_logs 
  WHERE status = 'rewarded';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION analyze_current_rewards() TO authenticated;
GRANT EXECUTE ON FUNCTION identify_rewards_to_reset() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_problematic_rewards(BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION verify_reset_results() TO authenticated;

-- Step 6: Add helpful comments
COMMENT ON FUNCTION analyze_current_rewards() IS 'Analyzes current reward status distribution';
COMMENT ON FUNCTION identify_rewards_to_reset() IS 'Identifies which rewards need to be reset due to decimal issues';
COMMENT ON FUNCTION reset_problematic_rewards(BOOLEAN) IS 'Resets problematic rewards back to pending status (dry_run param for safety)';
COMMENT ON FUNCTION verify_reset_results() IS 'Verifies that the reset operation worked correctly';

-- Step 7: Usage instructions (as comments)
/*
USAGE INSTRUCTIONS:

1. First, analyze current state:
   SELECT * FROM analyze_current_rewards();

2. Identify what will be reset:
   SELECT * FROM identify_rewards_to_reset() ORDER BY processed_at DESC;

3. Perform dry run to see what would be changed:
   SELECT * FROM reset_problematic_rewards(true);

4. If dry run looks correct, perform actual reset:
   SELECT * FROM reset_problematic_rewards(false);

5. Verify the results:
   SELECT * FROM verify_reset_results();

Expected outcome:
- 2 rewards should remain with status 'completed' (recent correct ones)
- All other previously completed rewards should be reset to 'pending'
- Related reading_logs should be updated accordingly
- Total pending AURA should be the sum of all reset rewards
*/