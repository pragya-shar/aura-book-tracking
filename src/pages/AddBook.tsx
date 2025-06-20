import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '@/components/CameraCapture';
import BookResultCard from '@/components/BookResultCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

  return (
    <div>
      <h1 className="text-3xl font-pixel tracking-widest text-amber-400">Add New Book</h1>
      <p className="text-stone-400 font-playfair italic mt-1">Scan a book cover to add it to your library with enhanced visual recognition.</p>
      
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
              <h2 className="text-xl font-pixel text-amber-400">Enhanced Visual Analysis</h2>
              {scanBookMutation.isPending && (
                <div className="flex items-center gap-2 mt-2 text-stone-400">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                  <span className="font-playfair italic">Analyzing with advanced visual recognition, ISBN detection, logo identification, and intelligent matching...</span>
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
                      {scanBookMutation.data.analysisData?.extractedISBNs?.length > 0 
                        ? "Found exact match using ISBN detection:" 
                        : scanBookMutation.data.analysisData?.confidence >= 90
                        ? "Found high-confidence match using enhanced visual analysis:"
                        : "Found potential match using enhanced visual analysis:"}
                    </p>
                    <BookResultCard 
                      book={scanBookMutation.data.book} 
                      analysisData={scanBookMutation.data.analysisData}
                      onSave={handleSaveBook}
                      onScanAnother={reset}
                      isSaving={saveBookMutation.isPending}
                    />
                  </div>
                ) : scanBookMutation.data.text ? (
                  <>
                    <div className="mt-2 p-4 border rounded-md bg-muted">
                      <p className="font-semibold mb-2">Could not find a matching book, but enhanced analysis detected:</p>
                      {scanBookMutation.data.analysisData?.extractedISBNs?.length > 0 && (
                        <p className="mb-2"><strong>ISBNs:</strong> {scanBookMutation.data.analysisData.extractedISBNs.join(', ')}</p>
                      )}
                      {scanBookMutation.data.analysisData?.logos > 0 && (
                        <p className="mb-2"><strong>Publisher logos detected:</strong> {scanBookMutation.data.analysisData.logos}</p>
                      )}
                      <p className="whitespace-pre-wrap font-sans"><strong>Text:</strong> {scanBookMutation.data.text}</p>
                    </div>
                    <Button onClick={reset} variant="outline" className="mt-4">Scan Another Book</Button>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-muted-foreground">No text could be detected from the image using enhanced analysis.</p>
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
