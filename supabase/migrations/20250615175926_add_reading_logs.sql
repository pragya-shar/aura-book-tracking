
ALTER TABLE public.books
ADD COLUMN finished_at TIMESTAMPTZ,
ADD COLUMN genres TEXT[];
