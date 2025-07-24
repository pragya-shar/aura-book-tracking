
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ParticleSystem from "@/components/ParticleSystem";
import InteractiveButton from "@/components/InteractiveButton";
import CascadingBookTitles from "@/components/CascadingBookTitles";
import ReadingFacts from "@/components/ReadingFacts";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

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
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)] animate-pulse" style={{ animationDuration: '4s' }}></div>

      {/* Cascading Book Titles */}
      <CascadingBookTitles />

      {/* Particle System */}
      <ParticleSystem />

      {/* Main content with entrance animations */}
      <div className="mb-8 z-10 px-4 animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider flex items-baseline justify-center text-amber-400 [text-shadow:0_0_8px_rgba(251,191,36,0.5),0_0_20px_rgba(251,191,36,0.3)] animate-scale-in">
          <span className="font-melody text-8xl md:text-9xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s', animationIterationCount: '1' }}>A</span>
          <span className="font-pixel ml-1 animate-fade-in" style={{ animationDelay: '0.8s' }}>URA</span>
        </h1>
        <p className="font-playfair text-stone-400 mt-2 text-lg md:text-xl italic animate-fade-in [text-shadow:0_0_6px_rgba(251,191,36,0.3),0_0_12px_rgba(251,191,36,0.1)]" style={{ animationDelay: '1.2s' }}>
          Uncover the mysteries of your reading adventures.
        </p>
      </div>

      {/* Reading Facts - appears after AURA animation */}
      <div className="animate-fade-in" style={{ animationDelay: '2s' }}>
        <ReadingFacts />
      </div>
      
      {/* Enter the Archives Button - appears after the fact */}
      <div className="animate-fade-in" style={{ animationDelay: '4s' }}>
        <InteractiveButton />
      </div>

      {/* Test Mint Button - New feature! */}
      <div className="animate-fade-in mt-4" style={{ animationDelay: '5s' }}>
        <Link to="/test-mint">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg border border-green-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <Coins className="w-5 h-5 mr-2" />
            🎉 Test Your AuraCoin Contract!
          </Button>
        </Link>
        <p className="text-xs text-stone-500 mt-2 animate-pulse">
          ✨ Your contract is deployed and ready for testing!
        </p>
      </div>
    </div>
  );
};

export default Index;
