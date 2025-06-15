
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, BookOpen, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="flex flex-col hover:shadow-lg transition-shadow">
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
              {book.page_count && (
                <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                    <p>{book.page_count} pages</p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default Library;
