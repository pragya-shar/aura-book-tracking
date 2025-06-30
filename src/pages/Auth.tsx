import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import AnimatedBookshelf from '@/components/AnimatedBookshelf';

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

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
    "The Hunger Games"
  ];

  useEffect(() => {
    if (session) {
      navigate('/library');
    }
  }, [session, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-stone-300 relative overflow-hidden p-4">
      {/* Animated Bookshelf Background */}
      <AnimatedBookshelf />
      
      {/* Cascading Book Titles with Halo Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {bookTitles.map((title, i) => (
          <div
            key={`book-title-${i}`}
            className="absolute animate-[cascade-fall_8s_linear_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              '--rotation': `${Math.random() * 360}deg`,
            } as React.CSSProperties}
          >
            {/* Halo light effect */}
            <div
              className="absolute w-12 h-8 rounded-full opacity-20 animate-pulse"
              style={{
                background: 'radial-gradient(ellipse, #fbbf24 0%, transparent 70%)',
                filter: 'blur(6px)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Book title */}
            <div
              className="text-amber-300/70 font-serif text-xs font-medium select-none"
              style={{
                textShadow: '0 0 12px #fbbf24, 0 0 20px #f59e0b, 0 2px 4px rgba(0, 0, 0, 0.5)',
                transform: `rotate(${(i % 5 - 2) * 8}deg)`,
              }}
            >
              {title}
            </div>
          </div>
        ))}
        
        {/* Additional smaller book titles */}
        {bookTitles.slice(0, 15).map((title, i) => (
          <div
            key={`small-book-title-${i}`}
            className="absolute animate-[cascade-fall_6s_linear_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              '--rotation': `${Math.random() * 360}deg`,
            } as React.CSSProperties}
          >
            {/* Smaller halo */}
            <div
              className="absolute w-8 h-6 rounded-full opacity-15 animate-pulse"
              style={{
                background: 'radial-gradient(ellipse, #fbbf24 0%, transparent 60%)',
                filter: 'blur(3px)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Small book title */}
            <div
              className="text-amber-300/50 font-serif text-xs select-none"
              style={{
                textShadow: '0 0 8px #fbbf24',
                transform: `rotate(${(i % 3 - 1) * 10}deg)`,
              }}
            >
              {title.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)] z-5"></div>
      
      <div className="z-50 w-full max-w-sm sm:max-w-md relative">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 bg-black/95 backdrop-blur-md border-2 border-amber-500/70 rounded-b-none relative overflow-visible shadow-2xl shadow-amber-500/30 z-50">
            <TabsTrigger value="login" className="data-[state=active]:bg-amber-500/30 data-[state=active]:text-amber-200 text-stone-200 font-medium z-50 relative">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-amber-500/30 data-[state=active]:text-amber-200 text-stone-200 font-medium z-50 relative">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="bg-black/95 backdrop-blur-md border-x-2 border-b-2 border-amber-500/70 text-stone-300 rounded-t-none shadow-2xl shadow-amber-500/30 z-50 relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-amber-200 font-pixel tracking-wider text-xl">Login</CardTitle>
                <CardDescription className="text-stone-200 font-playfair italic text-sm">Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="bg-black/95 backdrop-blur-md border-x-2 border-b-2 border-amber-500/70 text-stone-300 rounded-t-none shadow-2xl shadow-amber-500/30 z-50 relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-amber-200 font-pixel tracking-wider text-xl">Sign Up</CardTitle>
                <CardDescription className="text-stone-200 font-playfair italic text-sm">Create a new account to start tracking your reading.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <SignUpForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
