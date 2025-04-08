
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, isLoading = false }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLoginView) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch (error) {
      // Error is handled in parent component
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-card animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isLoginView ? 'Login' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isLoginView
              ? 'Enter your credentials to access your account'
              : 'Enter your information to create an account'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoComplete={isLoginView ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full mb-2" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isLoginView ? 'Login' : 'Create Account'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLoginView(!isLoginView)}
              disabled={isLoading}
            >
              {isLoginView ? 'Need an account? Register' : 'Already have an account? Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
