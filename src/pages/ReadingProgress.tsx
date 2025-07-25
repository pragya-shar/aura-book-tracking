
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, BookPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Tables } from '@/integrations/supabase/types';
import { LogProgressDialog } from '@/components/LogProgressDialog';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type BookWithProgress = Tables<'books'> & {
    latestLog?: Tables<'reading_logs'>;
};

const ReadingProgress = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: books, isLoading, isError, error } = useQuery({
    queryKey: ['reading-progress', user?.id],
    queryFn: async (): Promise<BookWithProgress[] | null> => {
      if (!user) {
        console.log('No user found, returning null');
        return null;
      }

      console.log('Fetching reading progress for user:', user.id);

      const [booksRes, logsRes] = await Promise.all([
        supabase.from('books').select('*').eq('user_id', user.id).order('title', { ascending: true }),
        supabase.from('reading_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      console.log('Books response:', booksRes);
      console.log('Logs response:', logsRes);

      if (booksRes.error) {
        console.error('Books error:', booksRes.error);
        throw new Error(booksRes.error.message);
      }
      if (logsRes.error) {
        console.error('Logs error:', logsRes.error);
        throw new Error(logsRes.error.message);
      }
      
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
    enabled: !!user && !loading,
  });

  const updatePageCountMutation = useMutation({
    mutationFn: async ({ bookId, gbooksId }: { bookId: string; gbooksId: string }) => {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${gbooksId}`);
      if (!response.ok) throw new Error('Failed to fetch book info');
      
      const bookInfo = await response.json();
      if (!bookInfo.volumeInfo?.pageCount) throw new Error('Page count not available');
      
      const { error } = await supabase
        .from('books')
        .update({ page_count: bookInfo.volumeInfo.pageCount })
        .eq('id', bookId);
        
      if (error) throw error;
      
      return bookInfo.volumeInfo.pageCount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', user?.id] });
      toast({
        title: "Page count updated",
        description: "Book page count has been fetched and updated.",
      });
    },
    onError: (error: Error) => {
      console.log('Could not update page count:', error.message);
    }
  });

  // Auto-update page counts for books that don't have them
  useEffect(() => {
    if (books) {
      books.forEach(book => {
        if ((!book.page_count || book.page_count === 0) && book.gbooks_id) {
          updatePageCountMutation.mutate({ bookId: book.id, gbooksId: book.gbooks_id });
        }
      });
    }
  }, [books]);

  return (
    <div className="h-full flex flex-col px-2 sm:px-0">
      <div className="flex-shrink-0 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-amber-400">Reading Progress</h1>
        <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">Track and update your reading progress for each book.</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="pr-2 sm:pr-4">
          {isLoading && (
            <div className="flex justify-center items-center h-32 sm:h-64">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-amber-500" />
            </div>
          )}

          {isError && (
            <Alert variant="destructive" className="mt-4 sm:mt-6">
              <AlertTitle>Error fetching reading progress</AlertTitle>
              <AlertDescription className="text-sm">{error.message}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !isError && books?.length === 0 && (
             <div className="text-center py-12 sm:py-16 border-2 border-dashed border-amber-500/20 rounded-lg mt-4 sm:mt-6 bg-black/20 mx-2 sm:mx-0">
                <BookOpen className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-stone-500" />
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-pixel text-amber-400">Your library is empty</h3>
                <p className="mt-1 text-xs sm:text-sm text-stone-400 font-playfair italic px-4">
                    Add a book to your library to start tracking your progress.
                </p>
                <div className="mt-4 sm:mt-6">
                    <Button asChild className="border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)] text-sm px-4 py-2" variant="outline">
                        <Link to="/add-book" className="flex items-center gap-2">
                            <BookPlus className="h-4 w-4" />
                            Add a Book
                        </Link>
                    </Button>
                </div>
            </div>
          )}
          
          {!isLoading && !isError && books && books.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-20 sm:pb-6">
              {books.map(book => {
                // Use actual page count if available, otherwise use estimated 300
                const maxPages = book.page_count && book.page_count > 0 ? book.page_count : 300;
                const currentPage = book.latestLog?.current_page || 0;
                const progress = Math.round((currentPage / maxPages) * 100);

                return (
                  <Card key={book.id} className="bg-black/30 border border-amber-500/30 text-stone-300">
                    <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                      <CardTitle className="line-clamp-2 font-playfair text-amber-400 text-sm sm:text-base">{book.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                      <div className="flex gap-3 sm:gap-4">
                        {book.image_url ? (
                          <img src={book.image_url} alt={`Cover of ${book.title}`} className="h-20 sm:h-24 w-auto rounded-md object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-20 sm:h-24 w-14 sm:w-16 bg-black/20 rounded-md flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-stone-500" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2 min-w-0">
                            <Progress value={progress} className="h-2 [&>div]:bg-amber-500 bg-black/20 border border-amber-500/20" />
                            <p className="text-xs sm:text-sm text-stone-400">
                                {progress}% complete
                            </p>
                            <p className="text-[10px] sm:text-xs text-stone-500 truncate">
                                {book.latestLog 
                                    ? `Page ${book.latestLog.current_page}`
                                    : 'Not started'}
                                {book.page_count && book.page_count > 0 ? ` / ${book.page_count}` : ` / ~${maxPages}`}
                            </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-3 sm:px-6 pt-0">
                      <LogProgressDialog book={book}>
                        <Button className="w-full border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)] text-xs sm:text-sm py-2 h-8 sm:h-10" variant="outline">
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
      </ScrollArea>
    </div>
  );
};
export default ReadingProgress;
