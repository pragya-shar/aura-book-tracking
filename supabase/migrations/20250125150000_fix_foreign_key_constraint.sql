-- Fix Foreign Key Constraint in Trigger
-- Migration: 20250125150000_fix_foreign_key_constraint.sql
-- Date: 2025-01-25 15:00:00
-- Description: Change to AFTER trigger to avoid foreign key constraint violation

-- Step 1: Drop the current BEFORE trigger
DROP TRIGGER IF EXISTS auto_book_completion_trigger ON public.reading_logs;

-- Step 2: Create improved AFTER trigger function with proper duplicate prevention
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
DECLARE
  book_page_count INTEGER;
  book_title TEXT;
  user_wallet_address TEXT;
  existing_reward_count INTEGER;
BEGIN
  -- Only process on INSERT or when current_page changes significantly
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.current_page IS DISTINCT FROM NEW.current_page) THEN
    
    -- Get book details
    SELECT page_count, title INTO book_page_count, book_title
    FROM public.books 
    WHERE id = NEW.book_id;
    
    -- Skip if no book found
    IF book_page_count IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Check if book is completed (100% or more) and reward not yet created
    IF NEW.current_page >= book_page_count AND NOT COALESCE(NEW.reward_created, FALSE) THEN
      
      -- Check if pending reward already exists (prevent duplicates)
      SELECT COUNT(*) INTO existing_reward_count
      FROM public.pending_rewards 
      WHERE user_id = NEW.user_id AND book_id = NEW.book_id;
      
      -- Only proceed if no existing reward
      IF existing_reward_count = 0 THEN
        
        -- Get user's wallet address
        SELECT wallet_address INTO user_wallet_address
        FROM public.user_profiles 
        WHERE user_id = NEW.user_id;
        
        -- Note: We don't update reading_logs here to avoid infinite trigger loops
        -- The reading log will be updated by the frontend after successful save
        
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
            NEW.id,  -- Now this ID exists since it's AFTER trigger
            user_wallet_address,
            book_page_count,
            book_title,
            book_page_count,
            NOW(),
            'pending'
          );
        END IF;
        
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create AFTER trigger (reading log exists now, so foreign key works)
CREATE TRIGGER auto_book_completion_trigger
  AFTER INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION handle_book_completion() TO authenticated;

-- Step 5: Add helpful comment
COMMENT ON FUNCTION handle_book_completion() IS 'AFTER trigger that avoids foreign key violations and prevents duplicates using existing_reward_count check'; 