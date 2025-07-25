-- Migration: Fix Trigger Stack Overflow
-- Date: 2025-07-21
-- Description: Fix the infinite loop in handle_book_completion trigger

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS book_completion_trigger ON public.reading_logs;

-- Step 2: Create a new trigger function that doesn't cause infinite loops
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
DECLARE
  book_page_count INTEGER;
  book_title TEXT;
  user_wallet_address TEXT;
BEGIN
  -- Only proceed if this is a new record or if current_page changed
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.current_page IS DISTINCT FROM NEW.current_page) THEN
    
    -- Get book details
    SELECT page_count, title INTO book_page_count, book_title
    FROM public.books 
    WHERE id = NEW.book_id;
    
    -- Get user's wallet address
    SELECT wallet_address INTO user_wallet_address
    FROM public.user_profiles 
    WHERE user_id = NEW.user_id;
    
    -- Check if book is now completed
    IF NEW.current_page >= book_page_count THEN
      -- Only update status if it's not already completed or rewarded
      IF NEW.status NOT IN ('completed', 'rewarded') THEN
        -- Update reading log status and reward amount WITHOUT triggering the trigger again
        UPDATE public.reading_logs 
        SET status = 'completed', reward_amount = book_page_count
        WHERE id = NEW.id AND status NOT IN ('completed', 'rewarded');
      END IF;
      
      -- Create pending reward if it doesn't exist
      INSERT INTO public.pending_rewards (
        user_id, 
        book_id, 
        wallet_address, 
        reward_amount, 
        book_title, 
        book_pages, 
        completed_at
      )
      SELECT 
        NEW.user_id,
        NEW.book_id,
        user_wallet_address,
        book_page_count, -- 1 AURA per page
        book_title,
        book_page_count,
        NEW.created_at
      WHERE NOT EXISTS (
        SELECT 1 FROM public.pending_rewards pr 
        WHERE pr.book_id = NEW.book_id AND pr.user_id = NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger with better conditions
CREATE TRIGGER book_completion_trigger
  AFTER INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();

-- Step 4: Add a function to manually trigger book completion (for existing data)
CREATE OR REPLACE FUNCTION trigger_book_completion_for_user(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  log_record RECORD;
BEGIN
  -- Process all reading logs for the user that should be completed
  FOR log_record IN 
    SELECT rl.id, rl.current_page, b.page_count, b.title, up.wallet_address
    FROM public.reading_logs rl
    JOIN public.books b ON rl.book_id = b.id
    JOIN public.user_profiles up ON rl.user_id = up.user_id
    WHERE rl.user_id = user_uuid 
      AND rl.current_page >= b.page_count
      AND rl.status NOT IN ('completed', 'rewarded')
  LOOP
    -- Update reading log
    UPDATE public.reading_logs 
    SET status = 'completed', reward_amount = log_record.page_count
    WHERE id = log_record.id;
    
    -- Create pending reward if it doesn't exist
    INSERT INTO public.pending_rewards (
      user_id, 
      book_id, 
      wallet_address, 
      reward_amount, 
      book_title, 
      book_pages, 
      completed_at
    )
    SELECT 
      user_uuid,
      rl.book_id,
      log_record.wallet_address,
      log_record.page_count,
      log_record.title,
      log_record.page_count,
      rl.created_at
    FROM public.reading_logs rl
    WHERE rl.id = log_record.id
    AND NOT EXISTS (
      SELECT 1 FROM public.pending_rewards pr 
      WHERE pr.book_id = rl.book_id AND pr.user_id = rl.user_id
    );
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_book_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_book_completion_for_user(UUID) TO authenticated; 