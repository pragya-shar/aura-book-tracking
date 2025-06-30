
import React from 'react';

const ParticleSystem = () => {
  const particles = Array.from({ length: 12 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-1 h-1 bg-amber-400/30 rounded-full animate-float-${i % 3}`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

export default ParticleSystem;
