
import React from 'react';
import NavBar from './NavBar';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  userId?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout, userId }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onLogout={onLogout} userId={userId} />
      <main className="flex-1 container py-6 md:py-8">
        {children}
      </main>
      <footer className="border-t border-white/10 py-4">
        <div className="container text-center text-xs text-muted-foreground">
          OnlyPips Journal © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
