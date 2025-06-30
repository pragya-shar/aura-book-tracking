
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const InteractiveButton = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (buttonRef.current && isHovered) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePosition({ x: x * 0.1, y: y * 0.1 });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  return (
    <div
      ref={buttonRef}
      className="relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <Button 
        asChild 
        size="lg" 
        variant="outline" 
        className={`
          border-amber-500 text-amber-500 bg-transparent 
          hover:bg-amber-500 hover:text-black 
          transition-all duration-300 ease-in-out 
          shadow-[0_0_15px_rgba(251,191,36,0.4)] 
          hover:shadow-[0_0_30px_rgba(251,191,36,0.8)]
          hover:scale-105
          relative overflow-hidden
          ${isHovered ? 'animate-pulse' : ''}
        `}
      >
        <Link to="/auth" className="relative z-10">
          Enter the Archives
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </Link>
      </Button>
    </div>
  );
};

export default InteractiveButton;
