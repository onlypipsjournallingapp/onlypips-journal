
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Trades from './Trades';
import ChecklistPage from '@/components/Checklist/ChecklistPage';
import MainLayout from '@/components/Layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData: any) => {
    console.log("Login handler triggered", userData);
    setUser(userData.user);
    setSession(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <MainLayout onLogout={handleLogout} userId={user.id}>
      <Routes>
        <Route path="/" element={<Dashboard userId={user.id} />} />
        <Route path="/trades" element={<Trades userId={user.id} />} />
        <Route path="/checklist" element={<ChecklistPage userId={user.id} />} />
        <Route path="/admin" element={<AdminNotifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default Index;
