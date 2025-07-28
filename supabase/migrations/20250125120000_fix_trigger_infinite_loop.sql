-- Fix Infinite Loop in Book Completion Trigger
-- Migration: 20250125120000_fix_trigger_infinite_loop.sql
-- Date: 2025-01-25
-- Description: Fix trigger that was causing 400 errors due to infinite loop

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS auto_book_completion_trigger ON public.reading_logs;

-- Step 2: Create corrected trigger function that modifies NEW directly
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
DECLARE
  book_page_count INTEGER;
  book_title TEXT;
  user_wallet_address TEXT;
BEGIN
  -- Only process on INSERT or when current_page changes significantly
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.current_page IS DISTINCT FROM NEW.current_page) THEN
    
    -- Get book details
    SELECT page_count, title INTO book_page_count, book_title
    FROM public.books 
    WHERE id = NEW.book_id;
    
    -- Check if book is completed (100% or more) and reward not yet created
    IF NEW.current_page >= book_page_count AND NOT COALESCE(NEW.reward_created, FALSE) THEN
      
      -- Get user's wallet address
      SELECT wallet_address INTO user_wallet_address
      FROM public.user_profiles 
      WHERE user_id = NEW.user_id;
      
      -- Modify NEW record directly (no separate UPDATE needed)
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

-- Step 3: Create BEFORE trigger (not AFTER) to modify the record before insertion/update
CREATE TRIGGER auto_book_completion_trigger
  BEFORE INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();

-- Step 4: Add helpful comment
COMMENT ON FUNCTION handle_book_completion() IS 'BEFORE trigger that modifies NEW record directly to avoid infinite loops'; 