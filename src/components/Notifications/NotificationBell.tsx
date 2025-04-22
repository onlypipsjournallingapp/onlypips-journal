
import React, { useState, useRef, useEffect } from "react";
import { Bell, BellDot } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotificationsDropdown from "./NotificationsDropdown";
import { Badge } from "@/components/ui/badge";

interface NotificationBellProps {
  userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      // 1. Get all notifications, left join user_notifications to check for read
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*, user_notifications: user_notifications!inner(read, read_at)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return notifications?.map((n: any) => ({
        ...n,
        read: n.user_notifications?.[0]?.read ?? false,
        read_at: n.user_notifications?.[0]?.read_at ?? null,
      })) ?? [];
    },
    refetchInterval: 10_000, // Slight polling for demo
  });

  const unreadCount = isLoading || !data ? 0 : data.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={bellRef}
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative p-1 rounded-md hover:bg-accent transition-colors"
      >
        {hasUnread ? (
          <>
            <BellDot className="h-6 w-6 text-primary" />
            <span className="absolute top-1 right-1">
              <span className="block h-2 w-2 rounded-full bg-destructive shadow ring-2 ring-background" />
            </span>
          </>
        ) : (
          <Bell className="h-6 w-6 text-primary" />
        )}
      </button>
      {open && (
        <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 z-50">
          <NotificationsDropdown
            notifications={data ?? []}
            userId={userId}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
export default NotificationBell;
