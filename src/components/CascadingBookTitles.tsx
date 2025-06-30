
import React from 'react';

const CascadingBookTitles = () => {
  const bookTitles = [
    "The Great Gatsby",
    "To Kill a Mockingbird", 
    "1984",
    "Pride and Prejudice",
    "The Catcher in the Rye",
    "Lord of the Flies",
    "The Hobbit",
    "Harry Potter",
    "The Chronicles of Narnia",
    "Dune",
    "Brave New World",
    "The Lord of the Rings",
    "Jane Eyre",
    "Wuthering Heights",
    "The Picture of Dorian Gray",
    "Frankenstein",
    "Dracula",
    "The Adventures of Huckleberry Finn",
    "Of Mice and Men",
    "The Grapes of Wrath",
    "Fahrenheit 451",
    "The Handmaid's Tale",
    "Gone Girl",
    "The Girl with the Dragon Tattoo",
    "The Hunger Games",
    "Twilight",
    "The Da Vinci Code",
    "The Alchemist",
    "Life of Pi",
    "The Kite Runner"
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bookTitles.map((title, index) => (
        <div
          key={title}
          className="absolute select-none text-amber-300/40 font-serif text-sm md:text-base hover:text-amber-300/60 transition-colors duration-300"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `-${Math.floor(index / 3) * 50}px`,
            animationDelay: `${index * 0.3}s`,
            animationDuration: `${8 + (index % 3) * 2}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationName: 'cascade-fall',
            transform: `rotate(${(index % 5 - 2) * 5}deg)`,
            textShadow: '0 0 10px rgba(251, 191, 36, 0.3), 0 0 20px rgba(251, 191, 36, 0.1)',
          }}
        >
          {title}
        </div>
      ))}
    </div>
  );
};

export default CascadingBookTitles;
