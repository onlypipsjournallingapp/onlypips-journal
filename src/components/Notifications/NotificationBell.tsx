
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import NotificationsDropdown from './NotificationsDropdown';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock notifications data - replace with actual data fetching logic
  const notifications = [
    {
      id: '1',
      title: 'Welcome to Trading Journal',
      description: 'Start tracking your trades for better performance insights.',
      created_at: new Date().toISOString(),
    }
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <NotificationsDropdown 
          notifications={notifications}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
