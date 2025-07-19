
-- Create books table to store user's library
CREATE TABLE public.books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gbooks_id text,
  title text NOT NULL,
  authors text[],
  description text,
  page_count integer,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, gbooks_id)
);

-- Add comment on books table
COMMENT ON TABLE public.books IS 'Stores books in the user''s library.';

-- Add RLS to books table
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Policies for books table
CREATE POLICY "Users can view their own books"
  ON public.books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON public.books FOR DELETE
  USING (auth.uid() = user_id);

-- Create reading_logs table
CREATE TABLE public.reading_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT now(),
  current_page integer NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK (current_page >= 0)
);

-- Add comment on reading_logs table
COMMENT ON TABLE public.reading_logs IS 'Stores reading progress for each book.';

-- Add RLS to reading_logs table
ALTER TABLE public.reading_logs ENABLE ROW LEVEL SECURITY;

-- Policies for reading_logs table
CREATE POLICY "Users can view their own reading logs"
  ON public.reading_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading logs"
  ON public.reading_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading logs"
  ON public.reading_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading logs"
  ON public.reading_logs FOR DELETE
  USING (auth.uid() = user_id);
