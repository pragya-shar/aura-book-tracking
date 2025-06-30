
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

  useEffect(() => {
    if (session) {
      navigate('/library');
    }
  }, [session, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-stone-300 relative overflow-hidden p-4">
      {/* Animated Bookshelf Background */}
      <AnimatedBookshelf />
      
      {/* Golden Confetti with Halo Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="absolute animate-[cascade-fall_8s_linear_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              '--rotation': `${Math.random() * 360}deg`,
            } as React.CSSProperties}
          >
            {/* Halo light effect */}
            <div
              className="absolute w-8 h-8 rounded-full opacity-30 animate-pulse"
              style={{
                background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
                filter: 'blur(4px)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Golden confetti piece */}
            <div
              className="w-3 h-3 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-sm opacity-80"
              style={{
                boxShadow: '0 0 8px #fbbf24, 0 0 16px #f59e0b',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          </div>
        ))}
        
        {/* Additional smaller confetti pieces */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`small-confetti-${i}`}
            className="absolute animate-[cascade-fall_6s_linear_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              '--rotation': `${Math.random() * 360}deg`,
            } as React.CSSProperties}
          >
            {/* Smaller halo */}
            <div
              className="absolute w-4 h-4 rounded-full opacity-20 animate-pulse"
              style={{
                background: 'radial-gradient(circle, #fbbf24 0%, transparent 60%)',
                filter: 'blur(2px)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Small confetti */}
            <div
              className="w-2 h-2 bg-gradient-to-br from-yellow-200 via-amber-300 to-yellow-500 rounded-full opacity-70"
              style={{
                boxShadow: '0 0 4px #fbbf24',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)] z-0"></div>
      
      <div className="z-10 w-full max-w-sm sm:max-w-md relative">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-amber-500/30 rounded-b-none relative overflow-visible">
            {/* Hanging fairy lights */}
            <div className="absolute -top-2 left-0 right-0 z-10 overflow-visible">
              {/* Main wire across the top */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-800/60 to-transparent"></div>
              
              {/* Individual hanging lights */}
              {[...Array(12)].map((_, i) => {
                const hangLength = 15 + Math.random() * 20; // Random hang length 15-35px
                const xPosition = 8 + (i * (100 - 16) / 11); // Distribute evenly across width
                
                return (
                  <div
                    key={`hanging-light-${i}`}
                    className="absolute"
                    style={{
                      left: `${xPosition}%`,
                      top: '0px',
                    }}
                  >
                    {/* Hanging wire */}
                    <div
                      className="absolute w-px bg-amber-800/40"
                      style={{
                        height: `${hangLength}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    />
                    
                    {/* Light bulb at end of wire */}
                    <div
                      className="absolute"
                      style={{
                        top: `${hangLength}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {/* Main light bulb */}
                      <div
                        className="w-3 h-3 bg-yellow-50 rounded-full animate-pulse border border-yellow-100"
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: `${2 + Math.random() * 0.5}s`,
                          boxShadow: '0 0 8px #fef3c7, 0 0 16px #fbbf24, 0 0 24px #f59e0b',
                          background: 'radial-gradient(circle, #fffbeb 0%, #fef3c7 40%, #fbbf24 100%)'
                        }}
                      />
                      {/* Outer glow effect */}
                      <div
                        className="absolute inset-0 w-6 h-6 -translate-x-1.5 -translate-y-1.5 rounded-full opacity-40 animate-pulse"
                        style={{
                          background: 'radial-gradient(circle, transparent 20%, #fbbf24 40%, transparent 80%)',
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: `${2.5 + Math.random() * 0.3}s`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <TabsTrigger value="login" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 text-stone-400">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 text-stone-400">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="bg-black/30 border-x border-b border-amber-500/30 text-stone-300 rounded-t-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-amber-400 font-pixel tracking-wider text-xl">Login</CardTitle>
                <CardDescription className="text-stone-400 font-playfair italic text-sm">Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="bg-black/30 border-x border-b border-amber-500/30 text-stone-300 rounded-t-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-amber-400 font-pixel tracking-wider text-xl">Sign Up</CardTitle>
                <CardDescription className="text-stone-400 font-playfair italic text-sm">Create a new account to start tracking your reading.</CardDescription>
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
