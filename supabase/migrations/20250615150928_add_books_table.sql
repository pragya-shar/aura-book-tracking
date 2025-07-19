
-- Create a new enum type for book status
CREATE TYPE public.book_status AS ENUM ('to-read', 'reading', 'read');

-- Add the status column to the books table
ALTER TABLE public.books
ADD COLUMN status public.book_status NOT NULL DEFAULT 'to-read';

-- Comment on the new column
COMMENT ON COLUMN public.books.status IS 'The reading status of the book.';
