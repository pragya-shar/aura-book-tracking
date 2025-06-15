
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, BookPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Tables } from '@/integrations/supabase/types';
import { LogProgressDialog } from '@/components/LogProgressDialog';
import { Link } from 'react-router-dom';

type BookWithProgress = Tables<'books'> & {
    latestLog?: Tables<'reading_logs'>;
};

const ReadingProgress = () => {
  const { user } = useAuth();

  const { data: books, isLoading, isError, error } = useQuery({
    queryKey: ['reading-progress', user?.id],
    queryFn: async (): Promise<BookWithProgress[] | null> => {
      if (!user) return null;

      const [booksRes, logsRes] = await Promise.all([
        supabase.from('books').select('*').eq('user_id', user.id).order('title', { ascending: true }),
        supabase.from('reading_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (booksRes.error) throw new Error(booksRes.error.message);
      if (logsRes.error) throw new Error(logsRes.error.message);
      
      const booksData = booksRes.data || [];
      const logsData = logsRes.data || [];

      const logMap = new Map<string, Tables<'reading_logs'>>();
      for (const log of logsData) {
        if (!logMap.has(log.book_id)) {
          logMap.set(log.book_id, log);
        }
      }

      const booksWithProgress: BookWithProgress[] = booksData.map(book => ({
        ...book,
        latestLog: logMap.get(book.id)
      }));

      return booksWithProgress;
    },
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Reading Progress</h1>
      <p className="text-muted-foreground">Track and update your reading progress for each book.</p>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error fetching reading progress</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && books?.length === 0 && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Your library is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Add a book to your library to start tracking your progress.
            </p>
            <div className="mt-6">
                <Button asChild>
                    <Link to="/add-book">
                        <BookPlus />
                        Add a Book
                    </Link>
                </Button>
            </div>
        </div>
      )}
      
      {!isLoading && !isError && books && books.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {books.map(book => {
            const progress = book.latestLog && book.page_count 
              ? Math.round((book.latestLog.current_page / book.page_count) * 100)
              : 0;

            return (
              <Card key={book.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    {book.image_url ? (
                      <img src={book.image_url} alt={`Cover of ${book.title}`} className="h-24 w-auto rounded-md object-cover" />
                    ) : (
                      <div className="h-24 w-16 bg-secondary rounded-md flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                            {progress}% complete
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {book.latestLog 
                                ? `Page ${book.latestLog.current_page}`
                                : 'Not started'}
                            {book.page_count ? ` / ${book.page_count}` : ''}
                        </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <LogProgressDialog book={book}>
                    <Button className="w-full">
                      {book.latestLog ? 'Update Progress' : 'Start Reading'}
                    </Button>
                  </LogProgressDialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ReadingProgress;
