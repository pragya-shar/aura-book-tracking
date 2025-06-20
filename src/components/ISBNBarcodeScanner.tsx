
import React, { useState, useRef, useCallback } from 'react';
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
import { ScanBarcode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ISBNBarcodeScannerProps {
  onCapture: (imageSrc: string) => void;
}

const ISBNBarcodeScanner: React.FC<ISBNBarcodeScannerProps> = ({ onCapture }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check your browser permissions.",
      });
      setIsScannerOpen(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsScannerOpen(open);
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const scanBarcode = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      const MAX_WIDTH = 800;
      const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
      
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
        handleOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={isScannerOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
          <ScanBarcode className="mr-2 h-4 w-4" />
          Scan ISBN Barcode
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-amber-400 font-pixel">Scan ISBN Barcode</DialogTitle>
          <p className="text-stone-400 text-sm">Position the ISBN barcode within the camera view for best results</p>
        </DialogHeader>
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md bg-muted" />
          <div className="absolute inset-0 border-2 border-amber-500/50 rounded-md pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-20 border-2 border-amber-400 bg-amber-400/10 rounded">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-medium">ISBN Barcode</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={scanBarcode}
            className="border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black"
            variant="outline"
          >
            Scan Barcode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ISBNBarcodeScanner;
