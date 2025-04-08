
import React, { useState } from 'react';
import AuthForm from '@/components/Auth/AuthForm';
import { TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be replaced with actual Supabase auth
      console.log('Login attempt with:', email, password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate successful login
      const mockUser = { id: '123', email };
      onLogin(mockUser);
      
      toast({
        title: "Login Successful",
        description: "Welcome back to OnlyPips Journal!",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be replaced with actual Supabase auth
      console.log('Register attempt with:', email, password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful registration and auto-login
      const mockUser = { id: '123', email };
      onLogin(mockUser);
      
      toast({
        title: "Registration Successful",
        description: "Welcome to OnlyPips Journal! Your account has been created.",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-black">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
          <TrendingUp className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Track. Analyze. Improve.</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">OnlyPips Journal</h1>
        <p className="text-muted-foreground">The trading journal for serious traders</p>
      </div>
      
      <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        By using this service, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default Auth;
