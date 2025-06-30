import { Loader2, BookOpen, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';
import { BookCard } from '@/components/BookCard';
import { EmptyLibraryState } from '@/components/EmptyLibraryState';
import { useLibraryBooks } from '@/hooks/useLibraryBooks';

const Library = () => {
  const { data: books, isLoading, isError, error } = useLibraryBooks();
  
  const readingBooks = books?.filter(book => book.status === 'reading') || [];
  const toReadBooks = books?.filter(book => book.status === 'to-read') || [];
  const readBooks = books?.filter(book => book.status === 'read') || [];

  const renderBookSection = (title: string, books: Tables<'books'>[]) => {
    if (books.length === 0) return null;
    return (
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-pixel tracking-wider text-amber-400 mb-2 sm:mb-3 border-b border-amber-500/20 pb-2">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 justify-items-center">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-amber-400">My Library</h1>
          <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">A collection of tales and whispers from your literary journeys.</p>
        </div>
        <Button asChild className="border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)] text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2 h-8 sm:h-10 w-full sm:w-auto" variant="outline">
          <Link to="/add-book" className="flex items-center justify-center gap-2">
            <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Add New Book</span>
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-32 sm:h-64">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive" className="mx-2 sm:mx-0">
          <AlertTitle>Error fetching books</AlertTitle>
          <AlertDescription className="text-sm">{error.message}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && books?.length === 0 && <EmptyLibraryState />}

      {!isLoading && !isError && books && books.length > 0 && (
        <div className="pb-20 sm:pb-6">
          {renderBookSection("Reading", readingBooks)}
          {renderBookSection("To Read", toReadBooks)}
          {renderBookSection("Read", readBooks)}
        </div>
      )}
    </div>
  );
};

export default Library;
