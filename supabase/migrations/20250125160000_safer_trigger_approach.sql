-- Safer Trigger Approach - Separate Reward Creation and Reading Log Updates
-- Migration: 20250125160000_safer_trigger_approach.sql
-- Date: 2025-01-25 16:00:00
-- Description: Update trigger to handle completion safely and create a helper function

-- Step 1: Drop current trigger and create improved version
DROP TRIGGER IF EXISTS auto_book_completion_trigger ON public.reading_logs;

-- Step 2: Create safer trigger function that only creates rewards
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
DECLARE
  book_page_count INTEGER;
  book_title TEXT;
  user_wallet_address TEXT;
  existing_reward_count INTEGER;
BEGIN
  -- Only process completion on INSERT or when current_page increases significantly
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.current_page < NEW.current_page) THEN
    
    -- Get book details
    SELECT page_count, title INTO book_page_count, book_title
    FROM public.books 
    WHERE id = NEW.book_id;
    
    -- Skip if no book found or page count not available
    IF book_page_count IS NULL OR book_page_count = 0 THEN
      RETURN NEW;
    END IF;
    
    -- Check if book is completed (100% or more) and reward not yet processed
    IF NEW.current_page >= book_page_count THEN
      
      -- Check if pending reward already exists (prevent duplicates)
      SELECT COUNT(*) INTO existing_reward_count
      FROM public.pending_rewards 
      WHERE user_id = NEW.user_id AND book_id = NEW.book_id;
      
      -- Only create reward if none exists
      IF existing_reward_count = 0 THEN
        
        -- Get user's wallet address
        SELECT wallet_address INTO user_wallet_address
        FROM public.user_profiles 
        WHERE user_id = NEW.user_id;
        
        -- Create pending reward if wallet is linked
        IF user_wallet_address IS NOT NULL THEN
          INSERT INTO public.pending_rewards (
            user_id, 
            book_id, 
            reading_log_id,
            wallet_address, 
            reward_amount, 
            book_title, 
            book_pages, 
            completed_at,
            status
          )
          VALUES (
            NEW.user_id,
            NEW.book_id,
            NEW.id,  -- Foreign key works now with AFTER trigger
            user_wallet_address,
            book_page_count,
            book_title,
            book_page_count,
            NOW(),
            'pending'
          );
          
          -- Log success for debugging
          RAISE NOTICE 'Created pending reward for user % book % with % AURA', NEW.user_id, NEW.book_id, book_page_count;
        END IF;
        
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create AFTER trigger 
CREATE TRIGGER auto_book_completion_trigger
  AFTER INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();

-- Step 4: Create helper function to update reading log completion status
CREATE OR REPLACE FUNCTION mark_reading_log_completed(log_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.reading_logs 
  SET 
    reward_created = TRUE,
    completed_at = COALESCE(completed_at, NOW())
  WHERE id = log_id AND reward_created = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION handle_book_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_reading_log_completed(UUID) TO authenticated;

-- Step 6: Add helpful comments
COMMENT ON FUNCTION handle_book_completion() IS 'AFTER trigger that creates pending rewards when books are completed - no reading_logs updates to avoid infinite loops';
COMMENT ON FUNCTION mark_reading_log_completed(UUID) IS 'Helper function to safely mark reading logs as completed after rewards are processed'; 