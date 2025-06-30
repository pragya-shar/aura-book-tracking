
import React from 'react';

const CascadingBookTitles = () => {
  const bookCovers = [
    { title: "The Great Gatsby", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=120&h=180&fit=crop" },
    { title: "To Kill a Mockingbird", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=120&h=180&fit=crop" },
    { title: "1984", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=120&h=180&fit=crop" },
    { title: "Pride and Prejudice", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=180&fit=crop" },
    { title: "The Catcher in the Rye", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&h=180&fit=crop" },
    { title: "Lord of the Flies", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&h=180&fit=crop" },
    { title: "The Hobbit", image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=120&h=180&fit=crop" },
    { title: "Harry Potter", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&h=180&fit=crop" },
    { title: "The Chronicles of Narnia", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=120&h=180&fit=crop" },
    { title: "Dune", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=120&h=180&fit=crop" },
    { title: "Brave New World", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=120&h=180&fit=crop" },
    { title: "The Lord of the Rings", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=180&fit=crop" },
    { title: "Jane Eyre", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&h=180&fit=crop" },
    { title: "Wuthering Heights", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&h=180&fit=crop" },
    { title: "The Picture of Dorian Gray", image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=120&h=180&fit=crop" },
    { title: "Frankenstein", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&h=180&fit=crop" },
    { title: "Dracula", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=120&h=180&fit=crop" },
    { title: "The Adventures of Huckleberry Finn", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=120&h=180&fit=crop" },
    { title: "Of Mice and Men", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=120&h=180&fit=crop" },
    { title: "The Grapes of Wrath", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=180&fit=crop" },
    { title: "Fahrenheit 451", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&h=180&fit=crop" },
    { title: "The Handmaid's Tale", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&h=180&fit=crop" },
    { title: "Gone Girl", image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=120&h=180&fit=crop" },
    { title: "The Girl with the Dragon Tattoo", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&h=180&fit=crop" },
    { title: "The Hunger Games", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=120&h=180&fit=crop" },
    { title: "Twilight", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=120&h=180&fit=crop" },
    { title: "The Da Vinci Code", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=120&h=180&fit=crop" },
    { title: "The Alchemist", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=180&fit=crop" },
    { title: "Life of Pi", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&h=180&fit=crop" },
    { title: "The Kite Runner", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&h=180&fit=crop" }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bookCovers.map((book, index) => (
        <div
          key={book.title}
          className="absolute select-none"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `-${Math.floor(index / 3) * 50}px`,
            animationDelay: `${index * 0.3}s`,
            animationDuration: `${8 + (index % 3) * 2}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationName: 'cascade-fall',
            transform: `rotate(${(index % 5 - 2) * 5}deg)`,
          }}
        >
          <div className="relative group">
            <img
              src={book.image}
              alt={book.title}
              className="w-16 h-24 md:w-20 md:h-30 lg:w-24 lg:h-36 object-cover rounded-md shadow-lg opacity-30 hover:opacity-50 transition-opacity duration-300"
              style={{
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.2), 0 0 30px rgba(251, 191, 36, 0.1)',
                filter: 'sepia(20%) saturate(1.2) brightness(0.8)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CascadingBookTitles;
