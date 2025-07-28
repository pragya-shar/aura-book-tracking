-- FINAL FIX for Book Completion Trigger Infinite Loop
-- Migration: 20250125130000_final_trigger_fix.sql  
-- Date: 2025-01-25 13:00:00
-- Description: Completely replace problematic trigger with working BEFORE trigger

-- Step 1: Completely drop ALL existing triggers and function
DROP TRIGGER IF EXISTS auto_book_completion_trigger ON public.reading_logs;
DROP TRIGGER IF EXISTS book_completion_trigger ON public.reading_logs;
DROP FUNCTION IF EXISTS handle_book_completion() CASCADE;

-- Step 2: Create the corrected trigger function that modifies NEW directly
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
DECLARE
  book_page_count INTEGER;
  book_title TEXT;
  user_wallet_address TEXT;
BEGIN
  -- Only process on INSERT or when current_page changes
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
      
      -- Get user's wallet address
      SELECT wallet_address INTO user_wallet_address
      FROM public.user_profiles 
      WHERE user_id = NEW.user_id;
      
      -- Modify NEW record directly (NO SEPARATE UPDATE - this prevents infinite loop!)
      NEW.reward_amount := book_page_count;
      NEW.reward_created := TRUE;
      NEW.completed_at := NOW();
      
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
          NEW.id,
          user_wallet_address,
          book_page_count,
          book_title,
          book_page_count,
          NOW(),
          'pending'
        )
        ON CONFLICT (user_id, book_id) DO NOTHING;
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create BEFORE trigger (critical - must be BEFORE not AFTER!)
CREATE TRIGGER auto_book_completion_trigger
  BEFORE INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION handle_book_completion() TO authenticated;

-- Step 5: Add helpful comment
COMMENT ON FUNCTION handle_book_completion() IS 'BEFORE trigger that modifies NEW record directly - prevents infinite loops by NOT using separate UPDATE statements'; 