
import React from 'react';
import TypewriterText from './TypewriterText';

const ReadingFacts = () => {
  const fact = "World's tallest book is over 6 feet tall. The \"Collection of Maritime Rules\" is stored in the Amsterdam Museum - it's about 6.4 feet high and over 3 feet wide!";

  return (
    <div className="mb-8 z-10 px-4 max-w-2xl mx-auto">
      <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-4 backdrop-blur-sm">
        <TypewriterText 
          text={fact}
          delay={0}
          speed={30}
          className="text-amber-300/90 text-sm md:text-base font-serif italic text-center leading-relaxed"
        />
      </div>
    </div>
  );
};

export default ReadingFacts;
