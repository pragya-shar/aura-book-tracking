
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { BrowserMultiFormatReader, NotFoundException, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
  onDetect: (isbn: string) => void;
  children: React.ReactNode;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetect, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const startScan = useCallback(async () => {
    if (!videoRef.current) return;

    // Use EAN_13 for ISBNs
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [10]); // 10 is BarcodeFormat.EAN_13

    codeReader.current = new BrowserMultiFormatReader(hints);
    
    try {
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error("No video input devices found.");
      }
      
      const backCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back')) || videoInputDevices[0];

      codeReader.current.decodeFromVideoDevice(backCamera.deviceId, videoRef.current, (result, err) => {
        if (result) {
          onDetect(result.getText());
          setIsOpen(false);
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error("Barcode scan error:", err);
          toast({
            variant: "destructive",
            title: "Scan Error",
            description: "An error occurred while scanning.",
          });
        }
      });
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check your browser permissions.",
      });
      setIsOpen(false);
    }
  }, [onDetect, toast]);

  const stopScan = useCallback(() => {
    if (codeReader.current) {
      codeReader.current.reset();
      codeReader.current = null;
    }
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      startScan();
    } else {
      stopScan();
    }
  }, [startScan, stopScan]);
  
  useEffect(() => {
    return () => stopScan();
  }, [stopScan]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Scan ISBN Barcode</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <video ref={videoRef} className="w-full h-auto rounded-md bg-muted" />
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
