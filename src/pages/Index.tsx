
import React, { useState, useEffect } from 'react';
import ParticleSystem from "@/components/ParticleSystem";
import TypewriterText from "@/components/TypewriterText";
import InteractiveButton from "@/components/InteractiveButton";

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-center text-stone-300 relative overflow-hidden">
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-800/5 transition-all duration-1000"
        style={{
          transform: `translate(${(mousePosition.x - 50) * 0.02}px, ${(mousePosition.y - 50) * 0.02}px)`,
        }}
      />
      
      {/* Reduced film grain effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.45%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-2 pointer-events-none animate-pulse"></div>
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/30 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] animate-pulse" style={{ animationDuration: '4s' }}></div>

      {/* Particle System */}
      <ParticleSystem />

      {/* Main content with entrance animations */}
      <div className="mb-8 z-10 px-4 animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider flex items-baseline justify-center text-amber-400 [text-shadow:0_0_8px_rgba(251,191,36,0.5),0_0_20px_rgba(251,191,36,0.3)] animate-scale-in">
          <span className="font-melody text-8xl md:text-9xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s', animationIterationCount: '1' }}>A</span>
          <span className="font-pixel ml-1 animate-fade-in" style={{ animationDelay: '0.8s' }}>URA</span>
        </h1>
        <p className="font-playfair text-stone-400 mt-2 text-lg md:text-xl italic animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <TypewriterText 
            text="Uncover the mysteries of your reading adventures." 
            delay={2000}
            speed={80}
          />
        </p>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '2s' }}>
        <InteractiveButton />
      </div>
    </div>
  );
};

export default Index;
