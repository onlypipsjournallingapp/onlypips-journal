
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, BookOpen, LogOut, ListChecks, Menu, Target, TrendingUpIcon } from 'lucide-react';
import NotificationBell from '@/components/Notifications/NotificationBell';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface NavBarProps {
  onLogout: () => void;
  userId?: string;
}

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ to, icon: Icon, children, className }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
        isActive ? "text-primary" : ""
      } ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
};

const NavBar: React.FC<NavBarProps> = ({ onLogout, userId }) => {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-10">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center font-bold text-lg mr-8">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            <span className="hidden md:inline">OnlyPips Journal</span>
            <span className="md:hidden">OnlyPips</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <NavLink to="/accounts" icon={BarChart3}>Dashboard</NavLink>
            <NavLink to="/trades" icon={BookOpen}>Trades</NavLink>
            <NavLink to="/predictor" icon={Target}>Predictor</NavLink>
            <NavLink to="/growth-path" icon={TrendingUpIcon}>Growth Path</NavLink>
            <NavLink to="/checklist" icon={ListChecks}>Checklist</NavLink>
          </nav>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu trigger */}
          <Drawer>
            <DrawerTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <nav className="flex flex-col gap-4 p-4">
                <NavLink to="/accounts" icon={BarChart3} className="p-2">Dashboard</NavLink>
                <NavLink to="/trades" icon={BookOpen} className="p-2">Trades</NavLink>
                <NavLink to="/predictor" icon={Target} className="p-2">Predictor</NavLink>
                <NavLink to="/growth-path" icon={TrendingUpIcon} className="p-2">Growth Path</NavLink>
                <NavLink to="/checklist" icon={ListChecks} className="p-2">Checklist</NavLink>
                <DrawerClose asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLogout}
                    className="w-full justify-start p-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </DrawerClose>
              </nav>
            </DrawerContent>
          </Drawer>

          {/* Notification bell and logout for desktop */}
          {userId && <NotificationBell userId={userId} />}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="hidden md:flex items-center"
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
