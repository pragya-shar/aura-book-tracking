import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, BookOpen, PlusCircle, MoreHorizontal, Trash2, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from '@/integrations/supabase/types';

const BookCard = ({ book }: { book: Tables<'books'> }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBookStatusMutation = useMutation({
    mutationFn: async ({ bookId, status }: { bookId: string, status: 'to-read' | 'reading' | 'read' }) => {
      const { error } = await supabase
        .from('books')
        .update({ status })
        .eq('id', bookId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
      toast({ title: `Book marked as ${variables.status.replace('-', ' ')}!` });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: "Error updating status", description: error.message });
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      // Also delete reading_logs for this book
      await supabase.from('reading_logs').delete().eq('book_id', bookId);
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
      toast({ title: "Book removed from library" });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: "Error removing book", description: error.message });
    }
  });
  
  const BookStatusBadge = ({ status }: { status: 'to-read' | 'reading' | 'read' }) => {
    if (status === 'reading') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Reading</span>;
    }
    if (status === 'read') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Read</span>;
    }
    return null;
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow relative group">
       <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background">
               <MoreHorizontal className="h-4 w-4" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
             {book.status !== 'reading' && (
               <DropdownMenuItem onClick={() => updateBookStatusMutation.mutate({ bookId: book.id, status: 'reading' })}>
                 <BookOpen className="mr-2" />
                 <span>Mark as Reading</span>
               </DropdownMenuItem>
             )}
             {book.status !== 'read' && (
              <DropdownMenuItem onClick={() => updateBookStatusMutation.mutate({ bookId: book.id, status: 'read' })}>
                 <Check className="mr-2" />
                 <span>Mark as Read</span>
               </DropdownMenuItem>
             )}
             {book.status !== 'to-read' && (
              <DropdownMenuItem onClick={() => updateBookStatusMutation.mutate({ bookId: book.id, status: 'to-read' })}>
                 <BookOpen className="mr-2" />
                 <span>Mark as To Read</span>
               </DropdownMenuItem>
             )}
             <DropdownMenuSeparator />
             <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => deleteBookMutation.mutate(book.id)}>
               <Trash2 className="mr-2" />
               <span>Remove</span>
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
      <CardHeader className="p-0">
        {book.image_url ? (
            <img
                src={book.image_url}
                alt={`Cover of ${book.title}`}
                className="rounded-t-lg object-cover aspect-[2/3] w-full"
            />
        ) : (
          <div className="aspect-[2/3] w-full bg-secondary rounded-t-lg flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="line-clamp-2 text-base font-semibold">{book.title}</CardTitle>
        <CardDescription className="line-clamp-1 text-sm">{book.authors?.join(', ')}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
        <span>{book.page_count ? `${book.page_count} pages` : ''}</span>
        <BookStatusBadge status={book.status} />
      </CardFooter>
    </Card>
  )
}


const Library = () => {
  const { user } = useAuth();

  const { data: books, isLoading, isError, error } = useQuery({
    queryKey: ['books', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!user,
  });
  
  const readingBooks = books?.filter(book => book.status === 'reading') || [];
  const toReadBooks = books?.filter(book => book.status === 'to-read') || [];
  const readBooks = books?.filter(book => book.status === 'read') || [];

  const renderBookSection = (title: string, books: Tables<'books'>[]) => {
    if (books.length === 0) return null;
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
          <h1 className="text-3xl font-bold">My Library</h1>
          <p className="text-muted-foreground">Here are the books in your library.</p>
        </div>
        <Button asChild>
          <Link to="/add-book">
            <PlusCircle />
            Add New Book
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

      {!isLoading && !isError && books?.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Your library is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Add your first book to get started.
            </p>
            <div className="mt-6">
                <Button asChild>
                    <Link to="/add-book">
                        <PlusCircle />
                        Add New Book
                    </Link>
                </Button>
            </div>
        </div>
      )}

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
