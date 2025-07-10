
import React from 'react';
import TypewriterText from './TypewriterText';

const ReadingFacts = () => {
  const facts = [
    "The smallest book in the world is 'Teeny Ted from Turnip Town' - it's only 70 micrometers by 100 micrometers and requires a microscope to read!",
    "The most expensive book ever sold was Leonardo da Vinci's 'Codex Leicester' for $30.8 million in 1994, purchased by Bill Gates.",
    "Iceland publishes more books per capita than any other country - about 5 books per 1,000 people annually!",
    "The Harry Potter series has been translated into 80 languages, making it one of the most translated book series in history.",
    "Ancient libraries used chains to prevent book theft - books were literally chained to reading desks!",
    "The longest novel ever written is 'In Search of Lost Time' by Marcel Proust, containing approximately 1.5 million words.",
    "Before paper, books were written on materials like papyrus, parchment, and even clay tablets that could weigh up to 30 pounds!",
    "The oldest known library was built around 2600 BCE in ancient Egypt, predating the famous Library of Alexandria by over 2,000 years!",
    "Speed reading world record holder Howard Berg was recorded reading at over 25,000 words per minute with high comprehension.",
    "The first novel ever written is believed to be 'The Tale of Genji' by Murasaki Shikibu in 11th century Japan."
  ];

  // Generate a random fact based on current time to ensure it changes
  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * facts.length);
    return facts[randomIndex];
  };

  const selectedFact = getRandomFact();

  return (
    <div className="mb-8 z-10 px-4 max-w-2xl mx-auto">
      <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-4 backdrop-blur-sm">
        <TypewriterText 
          text={selectedFact}
          delay={0}
          speed={30}
          className="text-amber-300/90 text-sm md:text-base font-serif italic text-center leading-relaxed"
        />
      </div>
    </div>
  );
};

export default ReadingFacts;
