-- Migration: Final AuraCoin Rewards Fixes
-- Date: 2025-07-21
-- Description: Fix all remaining issues in the AuraCoin rewards system

-- Step 1: Fix status consistency between tables
-- Update reading_logs status values to match pending_rewards
ALTER TABLE public.reading_logs 
DROP CONSTRAINT IF EXISTS reading_logs_status_check;

ALTER TABLE public.reading_logs 
ADD CONSTRAINT reading_logs_status_check 
CHECK (status IN ('in_progress', 'completed', 'rewarded'));

-- Step 2: Create trigger function to handle book completion
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
DECLARE
  book_page_count INTEGER;
  book_title TEXT;
  user_wallet_address TEXT;
BEGIN
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
    -- Update reading log status and reward amount
    UPDATE public.reading_logs 
    SET status = 'completed', reward_amount = book_page_count
    WHERE id = NEW.id;
    
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger on reading_logs
DROP TRIGGER IF EXISTS book_completion_trigger ON public.reading_logs;
CREATE TRIGGER book_completion_trigger
  AFTER INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();

-- Step 4: Add function to mark rewards as processed
CREATE OR REPLACE FUNCTION mark_reward_processed(
  reward_id UUID,
  transaction_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.pending_rewards 
  SET 
    status = 'completed',
    processed_at = NOW(),
    transaction_hash = COALESCE(transaction_hash, transaction_hash)
  WHERE id = reward_id AND status = 'pending';
  
  -- Update reading_logs status to 'rewarded'
  UPDATE public.reading_logs 
  SET status = 'rewarded'
  WHERE book_id = (
    SELECT book_id FROM public.pending_rewards WHERE id = reward_id
  ) AND user_id = (
    SELECT user_id FROM public.pending_rewards WHERE id = reward_id
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Add function to get user's total pending rewards
CREATE OR REPLACE FUNCTION get_user_pending_rewards(user_uuid UUID)
RETURNS TABLE (
  total_pending INTEGER,
  total_amount INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_pending,
    COALESCE(SUM(reward_amount), 0)::INTEGER as total_amount
  FROM public.pending_rewards 
  WHERE user_id = user_uuid AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Add function to get user's completed rewards
CREATE OR REPLACE FUNCTION get_user_completed_rewards(user_uuid UUID)
RETURNS TABLE (
  total_completed INTEGER,
  total_amount INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_completed,
    COALESCE(SUM(reward_amount), 0)::INTEGER as total_amount
  FROM public.pending_rewards 
  WHERE user_id = user_uuid AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_book_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_reward_processed(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_pending_rewards(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_completed_rewards(UUID) TO authenticated;

-- Step 8: Add comments for documentation
COMMENT ON FUNCTION handle_book_completion() IS 'Automatically creates pending rewards when books are completed';
COMMENT ON FUNCTION mark_reward_processed(UUID, TEXT) IS 'Marks a reward as processed and updates related tables';
COMMENT ON FUNCTION get_user_pending_rewards(UUID) IS 'Returns total pending rewards for a user';
COMMENT ON FUNCTION get_user_completed_rewards(UUID) IS 'Returns total completed rewards for a user'; 