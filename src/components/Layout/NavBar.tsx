
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, BookOpen, LogOut, ListChecks } from 'lucide-react';
import NotificationBell from '@/components/Notifications/NotificationBell';

interface NavBarProps {
  onLogout: () => void;
  userId?: string;
}

const NavBar: React.FC<NavBarProps> = ({ onLogout, userId }) => {
  const location = useLocation();
  return (
    <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-10">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="flex items-center font-bold text-lg mr-8">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          <span className="hidden md:inline">OnlyPips Journal</span>
          <span className="md:hidden">OnlyPips</span>
        </Link>
        
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              location.pathname === "/" ? "text-primary" : ""
            }`}
          >
            <BarChart3 className="mr-1 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/trades"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              location.pathname.startsWith("/trades") ? "text-primary" : ""
            }`}
          >
            <BookOpen className="mr-1 h-4 w-4" />
            <span>Trades</span>
          </Link>
          <Link
            to="/checklist"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              location.pathname.startsWith("/checklist") ? "text-primary" : ""
            }`}
          >
            <ListChecks className="mr-1 h-4 w-4" />
            <span>Checklist</span>
          </Link>
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          {userId && <NotificationBell userId={userId} />}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="flex items-center"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
