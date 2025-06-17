
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

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
      {/* Film grain effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5 pointer-events-none z-0"></div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-black/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-0"></div>
      
      <div className="z-10 w-full max-w-sm sm:max-w-md">
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
