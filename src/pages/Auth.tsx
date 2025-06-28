
import React from 'react';
import AuthForm from '@/components/Auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } else {
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TraderJournal
          </h1>
          <p className="text-muted-foreground mt-2">
            Track, analyze, and improve your trading performance
          </p>
        </div>
        <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
      </div>
    </div>
  );
};

export default Auth;
