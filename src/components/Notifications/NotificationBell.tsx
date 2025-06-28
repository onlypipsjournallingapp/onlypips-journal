
import React, { useState, useRef, useEffect } from "react";
import { Bell, BellDot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotificationsDropdown from "./NotificationsDropdown";

interface NotificationBellProps {
  userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all notifications without user filtering
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return notifications ?? [];
    },
    refetchInterval: 10_000, // Slight polling for demo
  });

  const unreadCount = isLoading || !data ? 0 : data.length;
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
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
export default NotificationBell;
