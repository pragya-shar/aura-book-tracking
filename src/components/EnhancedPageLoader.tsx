import React from 'react';
import LoadingCircle from './LoadingCircle';

const EnhancedPageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#000000]">
      {/* Subtle vignette effect matching app theme */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)]" />
      
      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Main loading circle */}
        <LoadingCircle size={64} strokeWidth={4} />
        
        {/* Loading text with AURA branding */}
        <div className="text-center">
          <div className="text-2xl font-bold tracking-wider flex items-baseline justify-center text-amber-400 [text-shadow:0_0_8px_rgba(251,191,36,0.5)] mb-2">
            <span className="font-melody text-3xl animate-pulse">A</span>
            <span className="font-pixel">URA</span>
          </div>
          <div className="text-stone-400 text-sm font-playfair italic">
            Loading your reading journey...
          </div>
        </div>
        
        {/* Subtle ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-amber-400/30 rounded-full animate-pulse"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${15 + Math.random() * 70}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + Math.random() * 1.5}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPageLoader;