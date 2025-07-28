-- Automatic Book Completion Detection Triggers
-- Migration: 20250125000001_book_completion_triggers.sql
-- Date: 2025-01-25
-- Description: Creates triggers for automatic reward detection when users complete books

-- Step 1: Create trigger function for automatic reward creation
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
      
      -- Update reading log with reward information
      UPDATE public.reading_logs 
      SET 
        reward_amount = book_page_count,
        reward_created = TRUE,
        completed_at = NOW()
      WHERE id = NEW.id AND NOT COALESCE(reward_created, FALSE);
      
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

-- Step 2: Create trigger on reading_logs table
DROP TRIGGER IF EXISTS auto_book_completion_trigger ON public.reading_logs;
CREATE TRIGGER auto_book_completion_trigger
  AFTER INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();

-- Step 3: Create helper function for manual completion triggering (fallback)
CREATE OR REPLACE FUNCTION trigger_completion_for_log(log_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  -- Manually trigger completion check for a specific log by updating it
  UPDATE public.reading_logs 
  SET current_page = current_page 
  WHERE id = log_id;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create helper function to get book completion status
CREATE OR REPLACE FUNCTION check_book_completion_status(user_uuid UUID, book_uuid UUID)
RETURNS TABLE (
  is_completed BOOLEAN,
  current_progress INTEGER,
  total_pages INTEGER,
  reward_created BOOLEAN,
  pending_reward_exists BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(rl.current_page >= b.page_count, FALSE) as is_completed,
    COALESCE(rl.current_page, 0) as current_progress,
    COALESCE(b.page_count, 0) as total_pages,
    COALESCE(rl.reward_created, FALSE) as reward_created,
    EXISTS(SELECT 1 FROM public.pending_rewards pr WHERE pr.user_id = user_uuid AND pr.book_id = book_uuid) as pending_reward_exists
  FROM public.books b
  LEFT JOIN public.reading_logs rl ON rl.book_id = b.id AND rl.user_id = user_uuid
  WHERE b.id = book_uuid AND b.user_id = user_uuid
  ORDER BY rl.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_book_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_completion_for_log(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_book_completion_status(UUID, UUID) TO authenticated;

-- Step 6: Add helpful comments
COMMENT ON FUNCTION handle_book_completion() IS 'Trigger function that automatically creates pending rewards when users complete books';
COMMENT ON FUNCTION trigger_completion_for_log(UUID) IS 'Manual fallback function to trigger completion check for a specific reading log';
COMMENT ON FUNCTION check_book_completion_status(UUID, UUID) IS 'Helper function to check the completion status of a book for a user'; 