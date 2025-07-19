-- Fix books that are marked as 'read' but have reading logs showing incomplete progress
UPDATE books 
SET status = 'reading', finished_at = NULL
WHERE status = 'read' 
AND id IN (
  SELECT DISTINCT b.id 
  FROM books b
  JOIN reading_logs rl ON b.id = rl.book_id
  WHERE b.status = 'read' 
  AND b.page_count IS NOT NULL 
  AND rl.current_page < b.page_count
  AND rl.created_at = (
    SELECT MAX(rl2.created_at) 
    FROM reading_logs rl2 
    WHERE rl2.book_id = b.id
  )
);