
import React from 'react';
import AuthForm from '@/components/Auth/AuthForm';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
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
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
