
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  read: boolean;
  read_at?: string | null;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  userId: string;
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  userId,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Mutation for marking all as read
  const { mutate: markAllRead, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      // Find unread notifications
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;

      // Insert/update user_notifications as read
      const { error } = await supabase.rpc("mark_notifications_read", {
        notification_ids: unreadIds,
        user_id: userId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  return (
    <div className="bg-popover border border-muted rounded shadow-lg p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-base">Notifications</div>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead()} disabled={isUpdating}>
            Mark all read
          </Button>
        )}
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
              className={`p-3 rounded cursor-pointer ${
                n.read ? "" : "bg-muted/20"
              } hover:bg-secondary transition`}
              title={n.description}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{n.title}</span>
                {!n.read && (
                  <Badge variant="destructive" className="ml-2">New</Badge>
                )}
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
