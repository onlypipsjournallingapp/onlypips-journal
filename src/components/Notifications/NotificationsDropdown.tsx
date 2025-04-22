
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  // We'll ignore 'read' and 'read_at' props as per the new logic.
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="bg-popover border border-muted rounded shadow-lg p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-base">Notifications</div>
        {/* Remove the "Mark all read" button as we don't have per-user read */}
      </div>
      {notifications.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded hover:bg-secondary transition"
              title={n.description}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{n.title}</span>
              </div>
              {n.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {n.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
