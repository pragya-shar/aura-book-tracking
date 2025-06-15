
import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';

const AddBook = () => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-bold">Add New Book</h1>
      <p className="text-muted-foreground">Scan or manually enter a new book to your library.</p>
      
      <div className="mt-6 space-y-4">
        <CameraCapture onCapture={setScannedImage} />
        
        {scannedImage && (
          <div>
            <h2 className="text-xl font-semibold">Scanned Image</h2>
            <div className="mt-2 border rounded-md p-2 inline-block">
              <img src={scannedImage} alt="Scanned book cover" className="mt-2 rounded-md max-w-sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddBook;
