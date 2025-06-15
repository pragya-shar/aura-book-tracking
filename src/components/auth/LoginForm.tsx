
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLoginDisabled, setIsLoginDisabled] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error logging in', description: error.message });
      const newLoginAttempts = loginAttempts + 1;
      setLoginAttempts(newLoginAttempts);
      if (newLoginAttempts >= 3) {
        setIsLoginDisabled(true);
        const timeout = 5000 * (newLoginAttempts - 2); // 5s, 10s, 15s...
        toast({ title: 'Too many failed login attempts', description: `Please try again in ${timeout / 1000} seconds.` });
        setTimeout(() => {
          setIsLoginDisabled(false);
        }, timeout);
      }
    } else {
      toast({ title: 'Logged in successfully!' });
      setLoginAttempts(0);
      navigate('/library');
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading || isLoginDisabled}>
          {(loading && !isLoginDisabled) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoginDisabled ? 'Try again later' : 'Login'}
        </Button>
      </form>
    </Form>
  );
};
