import React, { useEffect, useState } from 'react';

interface LoadingCircleProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const LoadingCircle: React.FC<LoadingCircleProps> = ({ 
  size = 48, 
  strokeWidth = 4,
  className = ""
}) => {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 100; // Stay at 100% instead of looping
        }
        return prevProgress + 5; // Faster increment rate (5% per 30ms = 100% in 0.6s)
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer glow ring */}
      <div 
        className="absolute rounded-full bg-amber-400/10 blur-sm animate-pulse"
        style={{ 
          width: size + 8, 
          height: size + 8,
          animationDuration: '2s'
        }}
      />
      
      {/* Main circle container */}
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-stone-800/40"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-amber-400 transition-all duration-75 ease-linear"
          style={{
            filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.4))'
          }}
        />
      </svg>
      
      {/* Center dot */}
      <div 
        className="absolute w-2 h-2 bg-amber-400 rounded-full animate-pulse"
        style={{ animationDuration: '1s' }}
      />
    </div>
  );
};

export default LoadingCircle;