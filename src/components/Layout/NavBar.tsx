
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Home, TrendingUp, Folder, Settings, ChevronDown, BarChart3, Target, CheckSquare, Zap, Shield, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "@/components/Notifications/NotificationBell";

interface NavBarProps {
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const mainNavItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/trades", icon: TrendingUp, label: "Trades" },
    { to: "/accounts", icon: Folder, label: "Accounts" },
  ];

  const moreNavItems = [
    { to: "/performance", icon: BarChart3, label: "Performance" },
    { to: "/growth-path", icon: Target, label: "Growth Path" },
    { to: "/checklist", icon: CheckSquare, label: "Checklist" },
    { to: "/predictor", icon: Zap, label: "Predictor" },
    { to: "/admin/events", icon: Shield, label: "Admin Events" },
    { to: "/admin/notifications", icon: Bell, label: "Admin Notifications" },
  ];

  const NavItems = () => (
    <>
      {mainNavItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActivePath(item.to)
              ? "bg-primary text-primary-foreground"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}

      {/* More dropdown for desktop */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <span>More</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {moreNavItems.map((item) => (
            <DropdownMenuItem key={item.to} asChild>
              <Link
                to={item.to}
                className={`flex items-center space-x-2 w-full ${
                  isActivePath(item.to) ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const MobileNavItems = () => (
    <div className="flex flex-col space-y-2">
      {[...mainNavItems, ...moreNavItems].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActivePath(item.to)
              ? "bg-primary text-primary-foreground"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              TradingApp
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavItems />
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <NotificationBell userId="" />
            
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Settings className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="flex-1 py-6">
                    <MobileNavItems />
                  </div>
                  <div className="border-t pt-4">
                    <Button
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
