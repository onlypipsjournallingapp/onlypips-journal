
import React from 'react';
import NavBar from './NavBar';
import AffiliatePopup from '@/components/Affiliate/AffiliatePopup';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onLogout={onLogout} />
      <main className="flex-1 container py-6 md:py-8">
        {children}
      </main>
      <footer className="border-t border-white/10 py-4">
        <div className="container text-center text-xs text-muted-foreground">
          TraderJournal © {new Date().getFullYear()}
        </div>
      </footer>
      
      {/* Affiliate Popup */}
      <AffiliatePopup userId={session?.user?.id} />
    </div>
  );
};

export default MainLayout;
