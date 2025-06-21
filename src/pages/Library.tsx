
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
      <div className="mb-8">
        <h2 className="text-xl font-pixel tracking-wider text-amber-400 mb-3 border-b border-amber-500/20 pb-2">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 justify-items-center">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-pixel tracking-widest text-amber-400">My Library</h1>
          <p className="text-stone-400 font-playfair italic mt-1 text-sm sm:text-base">A collection of tales and whispers from your literary journeys.</p>
        </div>
        <Button asChild className="border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)] text-xs sm:text-sm px-2 sm:px-4" variant="outline">
          <Link to="/add-book">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Book</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Error fetching books</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && books?.length === 0 && <EmptyLibraryState />}

      {!isLoading && !isError && books && books.length > 0 && (
        <>
          {renderBookSection("Reading", readingBooks)}
          {renderBookSection("To Read", toReadBooks)}
          {renderBookSection("Read", readBooks)}
        </>
      )}
    </div>
  );
};

export default Library;
