import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '@/components/CameraCapture';
import BookResultCard from '@/components/BookResultCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { TablesInsert } from '@/integrations/supabase/types';
import ISBNBarcodeScanner from '@/components/ISBNBarcodeScanner';

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
      
      // Ensure we have page count, if not try to fetch it from Google Books API
      let finalBookData = { ...bookData };
      
      if (!finalBookData.page_count && finalBookData.gbooks_id) {
        try {
          const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${finalBookData.gbooks_id}`);
          if (response.ok) {
            const bookInfo = await response.json();
            if (bookInfo.volumeInfo?.pageCount) {
              finalBookData.page_count = bookInfo.volumeInfo.pageCount;
            }
          }
        } catch (error) {
          console.log('Could not fetch additional book info:', error);
        }
      }
      
      const { data, error } = await supabase
        .from('books')
        .insert({ ...finalBookData, user_id: user.id });
        
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
    <div className="px-2 sm:px-0 pb-20 sm:pb-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-amber-400">Add New Book</h1>
        <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">Scan a book cover or ISBN barcode to add it to your library with enhanced visual recognition.</p>
      </div>
      
      <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {!scannedImage && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-pixel text-amber-400 mb-2 sm:mb-3">Scanning Options</h2>
              <div className="flex flex-col gap-3">
                <CameraCapture onCapture={handleCapture} />
                <ISBNBarcodeScanner onCapture={handleCapture} />
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 mt-2 font-playfair italic px-1">
                Use "Scan with Camera" for book covers or "Scan ISBN Barcode" for precise barcode detection
              </p>
            </div>
          </div>
        )}
        
        {scannedImage && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-pixel text-amber-400 mb-2">Scanned Image</h2>
              <div className="mt-2 border rounded-md p-2 inline-block border-amber-500/30 bg-black/20 max-w-full">
                <img src={scannedImage} alt="Scanned book cover" className="rounded-md max-w-full h-auto max-h-48 sm:max-h-64" />
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-pixel text-amber-400 mb-2">Enhanced Visual Analysis</h2>
              {scanBookMutation.isPending && (
                <div className="flex items-start gap-2 mt-2 text-stone-400">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="font-playfair italic text-xs sm:text-sm">Analyzing with advanced visual recognition, ISBN detection, logo identification, and intelligent matching...</span>
                </div>
              )}
              {scanBookMutation.isError && (
                 <Alert variant="destructive" className="mt-2">
                   <AlertTitle className="text-sm">Scan Failed</AlertTitle>
                   <AlertDescription className="text-xs sm:text-sm">
                    {scanBookMutation.error.message}. This could be a network issue or a problem with the edge function.
                   </AlertDescription>
                 </Alert>
              )}
              {scanBookMutation.isSuccess && (
                scanBookMutation.data.book ? (
                  <div>
                    <p className="text-xs sm:text-sm text-stone-400 font-playfair italic mb-2 sm:mb-3">
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
                    <div className="mt-2 p-3 sm:p-4 border rounded-md bg-muted">
                      <p className="font-semibold mb-2 text-sm">Could not find a matching book, but enhanced analysis detected:</p>
                      {scanBookMutation.data.analysisData?.extractedISBNs?.length > 0 && (
                        <p className="mb-2 text-xs sm:text-sm"><strong>ISBNs:</strong> {scanBookMutation.data.analysisData.extractedISBNs.join(', ')}</p>
                      )}
                      {scanBookMutation.data.analysisData?.logos > 0 && (
                        <p className="mb-2 text-xs sm:text-sm"><strong>Publisher logos detected:</strong> {scanBookMutation.data.analysisData.logos}</p>
                      )}
                      <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm"><strong>Text:</strong> {scanBookMutation.data.text}</p>
                    </div>
                    <Button onClick={reset} variant="outline" className="mt-3 sm:mt-4 w-full sm:w-auto">Scan Another Book</Button>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-muted-foreground text-xs sm:text-sm">No text could be detected from the image using enhanced analysis.</p>
                    <Button onClick={reset} variant="outline" className="mt-3 sm:mt-4 w-full sm:w-auto">Scan Another Book</Button>
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
