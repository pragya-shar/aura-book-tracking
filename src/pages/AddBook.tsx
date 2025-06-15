
import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AddBook = () => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const scanBookMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const { data, error } = await supabase.functions.invoke('scan-book', {
        body: { image: imageBase64 },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
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
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Add New Book</h1>
      <p className="text-muted-foreground">Scan a book cover to detect its title and other information.</p>
      
      <div className="mt-6 space-y-6">
        {!scannedImage && <CameraCapture onCapture={handleCapture} />}
        
        {scannedImage && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Scanned Image</h2>
              <div className="mt-2 border rounded-md p-2 inline-block">
                <img src={scannedImage} alt="Scanned book cover" className="rounded-md max-w-sm" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Detected Information</h2>
              {scanBookMutation.isPending && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Scanning for text and book information...</span>
                </div>
              )}
              {scanBookMutation.isError && (
                 <Alert variant="destructive" className="mt-2">
                   <AlertTitle>Scan Failed</AlertTitle>
                   <AlertDescription>
                    {scanBookMutation.error.message}. This could be a network issue or a problem with the edge function. You can check the function logs for more details.
                   </AlertDescription>
                 </Alert>
              )}
              {scanBookMutation.isSuccess && (
                scanBookMutation.data.book ? (
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle>{scanBookMutation.data.book.volumeInfo.title}</CardTitle>
                      <CardDescription>{scanBookMutation.data.book.volumeInfo.authors?.join(', ')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                      {scanBookMutation.data.book.volumeInfo.imageLinks?.thumbnail && (
                        <img src={scanBookMutation.data.book.volumeInfo.imageLinks.thumbnail} alt="Book cover" className="w-32 h-auto rounded-md object-cover" />
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-6">{scanBookMutation.data.book.volumeInfo.description}</p>
                    </CardContent>
                  </Card>
                ) : scanBookMutation.data.text ? (
                  <div className="mt-2 p-4 border rounded-md bg-muted">
                    <p className="font-semibold mb-2">Could not find a matching book on Google Books, but detected the following text:</p>
                    <p className="whitespace-pre-wrap font-sans">{scanBookMutation.data.text}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-muted-foreground">No text could be detected from the image.</p>
                )
              )}
            </div>
            
            <Button onClick={reset} variant="outline">Scan Another Book</Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddBook;
