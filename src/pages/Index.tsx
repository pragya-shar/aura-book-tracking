
import React, { useState, useEffect, Suspense, lazy } from 'react';

// Lazy load heavy components
const ParticleSystem = lazy(() => import("@/components/ParticleSystem"));
const CascadingBookTitles = lazy(() => import("@/components/CascadingBookTitles"));
const ReadingFacts = lazy(() => import("@/components/ReadingFacts"));

// Keep InteractiveButton as regular import since it's likely lightweight
import InteractiveButton from "@/components/InteractiveButton";

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showHeavyComponents, setShowHeavyComponents] = useState(false);

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

  // Load heavy components after a delay to improve initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHeavyComponents(true);
    }, 500); // Load heavy components after 500ms

    return () => clearTimeout(timer);
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
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)] animate-pulse" style={{ animationDuration: '4s' }}></div>

      {/* Lazy loaded heavy components */}
      {showHeavyComponents && (
        <Suspense fallback={null}>
          {/* Cascading Book Titles */}
          <CascadingBookTitles />

          {/* Particle System */}
          <ParticleSystem />
        </Suspense>
      )}

      {/* Main content with entrance animations - Load immediately */}
      <div className="mb-8 z-10 px-4 animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider flex items-baseline justify-center text-amber-400 [text-shadow:0_0_8px_rgba(251,191,36,0.5),0_0_20px_rgba(251,191,36,0.3)] animate-scale-in">
          <span className="font-melody text-8xl md:text-9xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s', animationIterationCount: '1' }}>A</span>
          <span className="font-pixel ml-1 animate-fade-in" style={{ animationDelay: '0.8s' }}>URA</span>
        </h1>
        <p className="font-playfair text-stone-400 mt-2 text-lg md:text-xl italic animate-fade-in [text-shadow:0_0_6px_rgba(251,191,36,0.3),0_0_12px_rgba(251,191,36,0.1)]" style={{ animationDelay: '1.2s' }}>
          Uncover the mysteries of your reading adventures,<br />
          <span className="text-amber-300 font-semibold [text-shadow:0_0_8px_rgba(251,191,36,0.6),0_0_16px_rgba(251,191,36,0.4)]">And earn AURA coins through Stellar!</span>
        </p>
      </div>

      {/* Reading Facts - Load after components are ready */}
      <div className="animate-fade-in" style={{ animationDelay: '2s' }}>
        {showHeavyComponents && (
          <Suspense fallback={<div className="w-64 h-16 bg-gray-800/50 rounded animate-pulse"></div>}>
            <ReadingFacts />
          </Suspense>
        )}
      </div>
      
      {/* Enter the Archives Button - appears after the fact */}
      <div className="animate-fade-in" style={{ animationDelay: '4s' }}>
        <InteractiveButton />
      </div>


    </div>
  );
};

export default Index;
