
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import QRBarcodeScanner from 'react-qr-barcode-scanner';

interface BarcodeScannerProps {
  onDetect: (isbn: string) => void;
  children: React.ReactNode;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetect, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdate = (err: unknown, result: { text: string } | undefined) => {
    if (result) {
      onDetect(result.text);
      setIsOpen(false);
    }
    // Errors are logged to the console but not shown as toasts,
    // as they can fire frequently when no barcode is in view.
    if (err) {
      console.info("Barcode scan info:", err);
    }
  };

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Scan ISBN Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at the book's barcode. The scan will happen automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          {isOpen && (
            <div className="w-full h-auto rounded-md bg-muted overflow-hidden">
              <QRBarcodeScanner
                onUpdate={handleUpdate}
                facingMode="environment"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
