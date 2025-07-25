
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Camera } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
      setIsCameraOpen(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsCameraOpen(open);
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const takePicture = () => {
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
        // Use jpeg for smaller file size and set quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
        handleOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={isCameraOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Camera className="mr-2 h-4 w-4" />
          Scan with Camera
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[625px]"
        aria-describedby="camera-capture-description"
      >
        <DialogHeader>
          <DialogTitle>Scan Book</DialogTitle>
          <DialogDescription id="camera-capture-description" className="sr-only">
            Use your camera to scan book covers or barcodes
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md bg-muted" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={takePicture}>Capture</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCapture;
