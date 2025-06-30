
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
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)] z-0"></div>
      
      <div className="z-10 w-full max-w-sm sm:max-w-md relative">
        {/* Fairy light strip on the login section */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-96 h-1 z-10">
          <div className="flex justify-between items-center h-full">
            {[...Array(15)].map((_, i) => (
              <div
                key={`auth-light-${i}`}
                className="relative"
              >
                {/* Main light bulb */}
                <div
                  className="w-2 h-2 bg-yellow-50 rounded-full animate-pulse border border-yellow-100"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${1.8 + Math.random() * 0.4}s`,
                    boxShadow: '0 0 6px #fef3c7, 0 0 12px #fbbf24, 0 0 18px #f59e0b',
                    background: 'radial-gradient(circle, #fffbeb 0%, #fef3c7 50%, #fbbf24 100%)'
                  }}
                />
                {/* Outer glow effect */}
                <div
                  className="absolute inset-0 w-4 h-4 -translate-x-1 -translate-y-1 rounded-full opacity-50 animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, transparent 30%, #fbbf24 50%, transparent 70%)',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${2.2 + Math.random() * 0.3}s`,
                  }}
                />
              </div>
            ))}
          </div>
          {/* Light string wire */}
          <div className="absolute top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-800/40 to-transparent"></div>
        </div>
        
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-amber-500/30 rounded-b-none">
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
