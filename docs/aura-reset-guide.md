# AURA Rewards Reset Guide

## Overview
This guide helps you reset the AURA coin rewards that were processed with decimal issues while preserving the 2 correctly processed recent rewards.

## Background
- **Problem**: Early AURA rewards were processed with decimal conversion issues
- **Goal**: Reset problematic rewards to `pending` status so they can be re-processed correctly
- **Preserve**: Keep the 2 most recent correctly processed rewards unchanged
- **Total AURA affected**: ~2081 AURA total, with 2 recent rewards processed correctly

## Files Created
1. `reset_aura_rewards.sql` - Step-by-step SQL script to run in Supabase
2. `20250730000000_reset_aura_rewards_decimal_fix.sql` - Migration with helper functions

## Step-by-Step Process

### Option A: Using the Simple SQL Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Copy and paste the contents of `reset_aura_rewards.sql`**

3. **Run the analysis sections first (Steps 1-4)**
   - Execute each section one by one
   - Review the results to understand what will be changed
   - Verify that you see 2 recent rewards that will be kept

4. **Execute the reset (Step 5)**
   - Uncomment the reset SQL code in Step 5
   - Run it to perform the actual reset
   - This will:
     - Change problematic rewards from `completed` → `pending`
     - Clear their `processed_at` and `transaction_hash`
     - Update related reading_logs from `rewarded` → `completed`

5. **Verify results (Step 6)**
   - Run the verification queries
   - Confirm you have exactly 2 `completed` rewards remaining
   - Confirm the rest are now `pending` and ready for re-processing

### Option B: Using the Migration (Advanced)

1. **Apply the migration**
   ```bash
   # If using local Supabase
   npx supabase db push
   
   # Or manually run the migration SQL in Supabase dashboard
   ```

2. **Use the helper functions**
   ```sql
   -- Analyze current state
   SELECT * FROM analyze_current_rewards();
   
   -- See what will be reset
   SELECT * FROM identify_rewards_to_reset() ORDER BY processed_at DESC;
   
   -- Dry run
   SELECT * FROM reset_problematic_rewards(true);
   
   -- Actual reset (when ready)
   SELECT * FROM reset_problematic_rewards(false);
   
   -- Verify results
   SELECT * FROM verify_reset_results();
   ```

## Expected Results After Reset

### Pending Rewards Table
- **Status `completed`**: Exactly 2 rewards (recent, correctly processed)
- **Status `pending`**: All other rewards, ready for re-processing
- **Total pending AURA**: ~2079 (2081 - 2 recent rewards)

### Reading Logs Table
- **Status `rewarded`**: 2 entries (corresponding to the 2 kept rewards)
- **Status `completed`**: All other book completions, ready for reward re-processing

## After the Reset

1. **Test the admin minting interface**
   - Go to your admin panel
   - Verify you can see all the pending rewards
   - The 2 recent rewards should not appear (they're already processed)

2. **Re-process rewards with correct decimals**
   - Use your existing admin minting functionality
   - Process rewards in small batches to avoid issues
   - Each reward should now mint the correct AURA amount (1 AURA per page)

## Safety Features

- **Preserves recent rewards**: The 2 most recent processed rewards remain untouched
- **Reversible**: The reset can be undone if needed (by changing status back)
- **Dry run capability**: You can preview changes before applying them
- **Detailed logging**: All changes are tracked and verified

## Rollback (If Needed)

If something goes wrong, you can rollback by running:

```sql
-- Rollback: Change pending rewards back to completed
-- (Only run if you need to undo the reset)
UPDATE pending_rewards 
SET 
  status = 'completed',
  processed_at = NOW()  -- Use current timestamp
WHERE status = 'pending' 
  AND reward_amount > 0;  -- Only reset actual rewards

-- Rollback: Change reading_logs back to rewarded
UPDATE reading_logs 
SET status = 'rewarded'
WHERE status = 'completed'
  AND reward_amount > 0;
```

## Support

If you encounter any issues:
1. Check the verification queries to see current state
2. The migration includes detailed error handling
3. All operations are logged for troubleshooting