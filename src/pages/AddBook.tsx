
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '@/components/CameraCapture';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { TablesInsert } from '@/integrations/supabase/types';

const AddBook = () => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const scanBookMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const { data, error } = await supabase.functions.invoke('scan-book', {
        body: { image: imageBase64 },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data;
    },
  });

  const saveBookMutation = useMutation({
    mutationFn: async (bookData: TablesInsert<'books'>) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('books')
        .insert({ ...bookData, user_id: user.id });
        
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error("This book is already in your library.");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Book Saved!",
        description: "The book has been added to your library.",
      });
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
      navigate('/library');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: "Error saving book",
        description: error.message,
      });
    }
  });

  const handleCapture = (imageSrc: string) => {
    setScannedImage(imageSrc);
    const base64Image = imageSrc.split(',')[1];
    if (base64Image) {
      scanBookMutation.mutate(base64Image);
    }
  };
  
  const reset = () => {
    setScannedImage(null);
    scanBookMutation.reset();
    saveBookMutation.reset();
  }

  const handleSaveBook = () => {
    const book = scanBookMutation.data?.book;
    if (!book) return;

    const bookData: TablesInsert<'books'> = {
      gbooks_id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      description: book.volumeInfo.description,
      page_count: book.volumeInfo.pageCount,
      image_url: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
      user_id: user!.id,
    };
    saveBookMutation.mutate(bookData);
  };

  const BookResultCard = ({ book }: { book: any }) => {
    const imageUrl = book.volumeInfo.imageLinks?.extraLarge || 
                     book.volumeInfo.imageLinks?.large || 
                     book.volumeInfo.imageLinks?.medium || 
                     book.volumeInfo.imageLinks?.thumbnail || 
                     book.volumeInfo.imageLinks?.smallThumbnail;

    return (
      <>
        <Card className="mt-2 bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="font-playfair text-amber-400">{book.volumeInfo.title}</CardTitle>
                <CardDescription className="text-stone-400">{book.volumeInfo.authors?.join(', ')}</CardDescription>
              </div>
              {book.volumeInfo.averageRating && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{book.volumeInfo.averageRating}</span>
                  {book.volumeInfo.ratingsCount && (
                    <span className="text-xs text-stone-500">({book.volumeInfo.ratingsCount})</span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Book cover" 
                className="w-32 h-auto rounded-md object-cover border border-amber-500/20" 
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-stone-400 line-clamp-6 mb-2">{book.volumeInfo.description || 'No description available'}</p>
              <div className="text-xs text-stone-500 space-y-1">
                {book.volumeInfo.publishedDate && (
                  <p>Published: {book.volumeInfo.publishedDate}</p>
                )}
                {book.volumeInfo.publisher && (
                  <p>Publisher: {book.volumeInfo.publisher}</p>
                )}
                {book.volumeInfo.pageCount && (
                  <p>Pages: {book.volumeInfo.pageCount}</p>
                )}
                {book.volumeInfo.categories && book.volumeInfo.categories.length > 0 && (
                  <p>Categories: {book.volumeInfo.categories.slice(0, 3).join(', ')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSaveBook} disabled={saveBookMutation.isPending} className="border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]" variant="outline">
            {saveBookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save to Library
          </Button>
          <Button onClick={reset} variant="outline" className="text-stone-300 border-stone-500 hover:bg-stone-700/50 hover:text-white">Scan Another</Button>
        </div>
      </>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-pixel tracking-widest text-amber-400">Add New Book</h1>
      <p className="text-stone-400 font-playfair italic mt-1">Scan a book cover to add it to your library.</p>
      
      <div className="mt-6 space-y-6">
        {!scannedImage && (
          <CameraCapture onCapture={handleCapture} />
        )}
        
        {scannedImage && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-pixel text-amber-400">Scanned Image</h2>
              <div className="mt-2 border rounded-md p-2 inline-block border-amber-500/30 bg-black/20">
                <img src={scannedImage} alt="Scanned book cover" className="rounded-md max-w-sm" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-pixel text-amber-400">Book Match Results</h2>
              {scanBookMutation.isPending && (
                <div className="flex items-center gap-2 mt-2 text-stone-400">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                  <span className="font-playfair italic">Analyzing image and finding the best book match...</span>
                </div>
              )}
              {scanBookMutation.isError && (
                 <Alert variant="destructive" className="mt-2">
                   <AlertTitle>Scan Failed</AlertTitle>
                   <AlertDescription>
                    {scanBookMutation.error.message}. This could be a network issue or a problem with the edge function.
                   </AlertDescription>
                 </Alert>
              )}
              {scanBookMutation.isSuccess && (
                scanBookMutation.data.book ? (
                  <div>
                    <p className="text-sm text-stone-400 font-playfair italic mb-3">
                      Found the best matching book from multiple candidates:
                    </p>
                    <BookResultCard book={scanBookMutation.data.book} />
                  </div>
                ) : scanBookMutation.data.text ? (
                  <>
                    <div className="mt-2 p-4 border rounded-md bg-muted">
                      <p className="font-semibold mb-2">Could not find a matching book on Google Books, but detected the following text:</p>
                      <p className="whitespace-pre-wrap font-sans">{scanBookMutation.data.text}</p>
                    </div>
                    <Button onClick={reset} variant="outline" className="mt-4">Scan Another Book</Button>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-muted-foreground">No text could be detected from the image.</p>
                    <Button onClick={reset} variant="outline" className="mt-4">Scan Another Book</Button>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddBook;
