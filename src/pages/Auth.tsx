
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useFreighter } from '@/contexts/FreighterContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { FreighterWalletButton } from '@/components/auth/FreighterWalletButton';
import AnimatedBookshelf from '@/components/AnimatedBookshelf';

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isWalletConnected, walletAddress } = useFreighter();

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
    if (session || (isWalletConnected && walletAddress)) {
      navigate('/library');
    }
  }, [session, isWalletConnected, walletAddress, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-stone-300 relative overflow-hidden p-2 sm:p-4">
      {/* Animated Bookshelf Background */}
      <AnimatedBookshelf />
      
      {/* Cascading Book Titles with Halo Lights - Reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {bookTitles.slice(0, window.innerWidth < 768 ? 15 : 25).map((title, i) => (
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
              className="absolute w-8 h-6 sm:w-12 sm:h-8 rounded-full opacity-15 sm:opacity-20 animate-pulse"
              style={{
                background: 'radial-gradient(ellipse, #fbbf24 0%, transparent 70%)',
                filter: 'blur(3px) sm:blur(6px)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Book title */}
            <div
              className="text-amber-300/50 sm:text-amber-300/70 font-serif text-[10px] sm:text-xs font-medium select-none"
              style={{
                textShadow: '0 0 8px #fbbf24, 0 0 12px #f59e0b, 0 1px 2px rgba(0, 0, 0, 0.5)',
                transform: `rotate(${(i % 5 - 2) * 6}deg)`,
              }}
            >
              {window.innerWidth < 768 ? title.split(' ')[0] : title}
            </div>
          </div>
        ))}
      </div>
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)] z-5"></div>
      
      <div className="z-50 w-full max-w-xs sm:max-w-sm md:max-w-md relative">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-b-none relative overflow-visible shadow-xl shadow-amber-500/10 z-50 h-12 sm:h-auto">
            <TabsTrigger value="login" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 text-stone-200 font-medium z-50 relative text-sm sm:text-base py-2 sm:py-3">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 text-stone-200 font-medium z-50 relative text-sm sm:text-base py-2 sm:py-3">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="bg-black/60 backdrop-blur-md border-x border-b border-amber-500/30 text-stone-300 rounded-t-none shadow-xl shadow-amber-500/10 z-50 relative">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-amber-200 font-pixel tracking-wider text-lg sm:text-xl">Login</CardTitle>
                <CardDescription className="text-stone-200 font-playfair italic text-xs sm:text-sm">Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="bg-black/60 backdrop-blur-md border-x border-b border-amber-500/30 text-stone-300 rounded-t-none shadow-xl shadow-amber-500/10 z-50 relative">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-amber-200 font-pixel tracking-wider text-lg sm:text-xl">Sign Up</CardTitle>
                <CardDescription className="text-stone-200 font-playfair italic text-xs sm:text-sm">Create a new account to start tracking your reading.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <SignUpForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Wallet Connection Section */}
        <div className="mt-6">
          <div className="text-center mb-4">
            <Separator className="bg-amber-500/30" />
            <p className="text-amber-200/70 text-sm mt-2 font-medium">OR</p>
            <Separator className="bg-amber-500/30" />
          </div>
          
          <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 text-stone-300 shadow-xl shadow-purple-500/10">
            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-purple-200 font-pixel tracking-wider text-lg sm:text-xl">Connect Wallet</CardTitle>
              <CardDescription className="text-stone-200 font-playfair italic text-xs sm:text-sm">
                Connect your Freighter Stellar wallet for decentralized access.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
              <FreighterWalletButton 
                onSuccess={(address) => {
                  console.log('Wallet connected:', address);
                }}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
