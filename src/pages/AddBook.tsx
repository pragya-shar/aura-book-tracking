
import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AddBook = () => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const scanBookMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
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

  if (!supabase) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Add New Book</h1>
        <p className="text-muted-foreground">Scan a book cover to detect its title and other information.</p>
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Could not connect to Supabase. This can sometimes happen after the initial setup. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
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
                  <span>Scanning for text...</span>
                </div>
              )}
              {scanBookMutation.isError && (
                 <Alert variant="destructive" className="mt-2">
                   <AlertTitle>Scan Failed</AlertTitle>
                   <AlertDescription>{scanBookMutation.error.message}</AlertDescription>
                 </Alert>
              )}
              {scanBookMutation.isSuccess && (
                scanBookMutation.data.text ? (
                  <div className="mt-2 p-4 border rounded-md bg-muted">
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
