
import React from 'react';

const AnimatedBookshelf = () => {
  // Generate random books with different heights, colors, and titles
  const generateBooks = () => {
    const bookColors = [
      'bg-amber-700', 'bg-amber-800', 'bg-amber-900',
      'bg-stone-700', 'bg-stone-800', 'bg-stone-900',
      'bg-yellow-800', 'bg-orange-800', 'bg-red-900',
      'bg-green-900', 'bg-blue-900', 'bg-purple-900'
    ];
    
    const books = [];
    for (let shelf = 0; shelf < 6; shelf++) {
      const shelfBooks = [];
      for (let i = 0; i < 12; i++) {
        const height = Math.random() * 40 + 60; // 60-100px height
        const width = Math.random() * 20 + 15; // 15-35px width
        const color = bookColors[Math.floor(Math.random() * bookColors.length)];
        const delay = Math.random() * 5; // Random animation delay
        
        shelfBooks.push({
          id: `${shelf}-${i}`,
          height,
          width,
          color,
          delay
        });
      }
      books.push(shelfBooks);
    }
    return books;
  };

  const bookShelves = generateBooks();

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {/* Left bookshelf */}
      <div className="absolute left-0 top-0 h-full w-64 flex flex-col justify-between py-8">
        {bookShelves.slice(0, 3).map((shelf, shelfIndex) => (
          <div key={`left-${shelfIndex}`} className="relative h-24 border-b border-amber-500/30">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-start gap-1 px-4">
              {shelf.map((book) => (
                <div
                  key={book.id}
                  className={`${book.color} border border-amber-500/20 animate-pulse`}
                  style={{
                    width: `${book.width}px`,
                    height: `${book.height}px`,
                    animationDelay: `${book.delay}s`,
                    animationDuration: '3s'
                  }}
                />
              ))}
            </div>
            {/* Brighter and more yellow fairy lights for left shelf */}
            <div className="absolute top-2 left-0 right-0 flex justify-between px-6">
              {[...Array(8)].map((_, lightIndex) => (
                <div
                  key={`left-light-${shelfIndex}-${lightIndex}`}
                  className="w-2 h-2 bg-yellow-200 rounded-full animate-pulse shadow-2xl shadow-yellow-200/100 border border-yellow-100/80"
                  style={{
                    animationDelay: `${lightIndex * 0.2 + shelfIndex * 0.5}s`,
                    animationDuration: `${2 + Math.random()}s`,
                    boxShadow: '0 0 12px #fef08a, 0 0 24px #facc15, 0 0 36px #eab308, 0 0 48px #ca8a04'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right bookshelf */}
      <div className="absolute right-0 top-0 h-full w-64 flex flex-col justify-between py-8">
        {bookShelves.slice(3, 6).map((shelf, shelfIndex) => (
          <div key={`right-${shelfIndex}`} className="relative h-24 border-b border-amber-500/30">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-start gap-1 px-4">
              {shelf.map((book) => (
                <div
                  key={book.id}
                  className={`${book.color} border border-amber-500/20 animate-pulse`}
                  style={{
                    width: `${book.width}px`,
                    height: `${book.height}px`,
                    animationDelay: `${book.delay}s`,
                    animationDuration: '4s'
                  }}
                />
              ))}
            </div>
            {/* Brighter and more yellow fairy lights for right shelf */}
            <div className="absolute top-2 left-0 right-0 flex justify-between px-6">
              {[...Array(8)].map((_, lightIndex) => (
                <div
                  key={`right-light-${shelfIndex}-${lightIndex}`}
                  className="w-2 h-2 bg-yellow-200 rounded-full animate-pulse shadow-2xl shadow-yellow-200/100 border border-yellow-100/80"
                  style={{
                    animationDelay: `${lightIndex * 0.3 + shelfIndex * 0.7}s`,
                    animationDuration: `${2.5 + Math.random()}s`,
                    boxShadow: '0 0 12px #fef08a, 0 0 24px #facc15, 0 0 36px #eab308, 0 0 48px #ca8a04'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Brighter and more yellow connecting fairy light strings */}
      <div className="absolute top-16 left-64 right-64 h-1">
        <div className="flex justify-between items-center h-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={`connect-light-${i}`}
              className="w-2 h-2 bg-yellow-100 rounded-full animate-pulse shadow-2xl shadow-yellow-100/100 border border-yellow-50/90"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.5 + Math.random() * 0.5}s`,
                boxShadow: '0 0 16px #fefce8, 0 0 32px #fef08a, 0 0 48px #facc15, 0 0 64px #eab308'
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating book particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-3 h-4 bg-amber-600/30 animate-float-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* More prominent reading lamp effect */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-amber-300/15 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-amber-200/25 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
    </div>
  );
};

export default AnimatedBookshelf;
