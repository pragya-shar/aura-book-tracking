import React from 'react';
import LoadingCircle from './LoadingCircle';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingOverlay: React.FC = () => {
  const { isLoading, message } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#000000] backdrop-blur-sm" />
      
      {/* Subtle vignette effect matching app theme */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)]" />
      
      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Loading circle */}
        <LoadingCircle size={64} strokeWidth={4} />
        
        {/* Loading message */}
        <div className="text-center">
          <div className="text-amber-400 text-lg font-pixel tracking-wider [text-shadow:0_0_8px_rgba(251,191,36,0.3)]">
            {message}
          </div>
          <div className="text-stone-400 text-sm font-playfair italic mt-2">
            Please wait while we prepare your experience...
          </div>
        </div>
        
        {/* Ambient particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/20 rounded-full animate-pulse"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;