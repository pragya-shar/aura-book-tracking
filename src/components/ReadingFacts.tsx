
import React, { useState, useEffect } from 'react';
import TypewriterText from './TypewriterText';

const ReadingFacts = () => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [showFact, setShowFact] = useState(true);

  const facts = [
    "World's tallest book is over 6 feet tall! The 'Collection of Maritime Rules' is stored in the Amsterdam Museum. Its height is about 6.4 feet, and it's over 3 feet wide. Can you imagine the scale of this giant folio!?",
    "The smell of old books comes from over 300 volatile organic compounds. The sweet, vanilla-like scent is primarily from lignin breaking down in the paper.",
    "Reading fiction can increase empathy by up to 10%. Studies show that people who read literary fiction score higher on empathy tests than those who don't.",
    "The fastest reader on record can read 25,000 words per minute with 67% comprehension. That's about 100 pages in just 4 minutes!",
    "Iceland publishes more books per capita than any other country. They publish 5 titles per 1,000 people annually - that's incredible literary culture!",
    "The word 'bookworm' originally referred to actual insects that would bore holes through books. Now it's a badge of honor for avid readers!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFact(false);
      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
        setShowFact(true);
      }, 500);
    }, 8000); // Change fact every 8 seconds

    return () => clearInterval(interval);
  }, [facts.length]);

  return (
    <div className="mb-8 z-10 px-4 max-w-2xl mx-auto">
      <div 
        className={`min-h-[120px] transition-opacity duration-500 ${showFact ? 'opacity-100' : 'opacity-0'}`}
      >
        {showFact && (
          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-lg p-6 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <TypewriterText
                  key={currentFactIndex}
                  text={facts[currentFactIndex]}
                  delay={200}
                  speed={30}
                  className="text-stone-300 text-sm md:text-base leading-relaxed font-light"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingFacts;
