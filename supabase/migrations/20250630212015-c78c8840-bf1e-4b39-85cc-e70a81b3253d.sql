
-- Add new columns to books table for enhanced metadata
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS personal_review TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS custom_tags TEXT[];
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS reading_context TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS publisher TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS publication_year INTEGER;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS isbn TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS edition TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS series_name TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS series_order INTEGER;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS loan_to TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS loan_date DATE;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS loan_return_date DATE;

-- Create custom shelves table
CREATE TABLE IF NOT EXISTS public.custom_shelves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#FBBF24',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on custom_shelves
ALTER TABLE public.custom_shelves ENABLE ROW LEVEL SECURITY;

-- Policies for custom_shelves
CREATE POLICY "Users can view their own shelves" ON public.custom_shelves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own shelves" ON public.custom_shelves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shelves" ON public.custom_shelves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shelves" ON public.custom_shelves FOR DELETE USING (auth.uid() = user_id);

-- Create book_shelf_assignments table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.book_shelf_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  shelf_id UUID NOT NULL REFERENCES public.custom_shelves(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, shelf_id)
);

-- Enable RLS on book_shelf_assignments
ALTER TABLE public.book_shelf_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for book_shelf_assignments (users can manage assignments for their own books and shelves)
CREATE POLICY "Users can view their own book shelf assignments" ON public.book_shelf_assignments FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.books WHERE books.id = book_shelf_assignments.book_id AND books.user_id = auth.uid())
);

CREATE POLICY "Users can create their own book shelf assignments" ON public.book_shelf_assignments FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.books WHERE books.id = book_shelf_assignments.book_id AND books.user_id = auth.uid())
);

CREATE POLICY "Users can delete their own book shelf assignments" ON public.book_shelf_assignments FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.books WHERE books.id = book_shelf_assignments.book_id AND books.user_id = auth.uid())
);

-- Create reading goals table
CREATE TABLE IF NOT EXISTS public.reading_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  target_books INTEGER NOT NULL,
  target_pages INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable RLS on reading_goals
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;

-- Policies for reading_goals
CREATE POLICY "Users can view their own reading goals" ON public.reading_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reading goals" ON public.reading_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reading goals" ON public.reading_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reading goals" ON public.reading_goals FOR DELETE USING (auth.uid() = user_id);

-- Create reading lists table
CREATE TABLE IF NOT EXISTS public.reading_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_wishlist BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reading_lists
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;

-- Policies for reading_lists
CREATE POLICY "Users can view their own reading lists" ON public.reading_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reading lists" ON public.reading_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reading lists" ON public.reading_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reading lists" ON public.reading_lists FOR DELETE USING (auth.uid() = user_id);

-- Create book_list_assignments table
CREATE TABLE IF NOT EXISTS public.book_list_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.reading_lists(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, list_id)
);

-- Enable RLS on book_list_assignments
ALTER TABLE public.book_list_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for book_list_assignments
CREATE POLICY "Users can view their own book list assignments" ON public.book_list_assignments FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.books WHERE books.id = book_list_assignments.book_id AND books.user_id = auth.uid())
);

CREATE POLICY "Users can create their own book list assignments" ON public.book_list_assignments FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.books WHERE books.id = book_list_assignments.book_id AND books.user_id = auth.uid())
);

CREATE POLICY "Users can delete their own book list assignments" ON public.book_list_assignments FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.books WHERE books.id = book_list_assignments.book_id AND books.user_id = auth.uid())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_rating ON public.books(rating);
CREATE INDEX IF NOT EXISTS idx_books_custom_tags ON public.books USING GIN(custom_tags);
CREATE INDEX IF NOT EXISTS idx_books_series_name ON public.books(series_name);
CREATE INDEX IF NOT EXISTS idx_books_publication_year ON public.books(publication_year);
CREATE INDEX IF NOT EXISTS idx_books_is_favorite ON public.books(is_favorite);
CREATE INDEX IF NOT EXISTS idx_reading_logs_date ON public.reading_logs(date);
