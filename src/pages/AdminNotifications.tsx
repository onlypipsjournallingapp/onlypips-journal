
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const AdminNotifications: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required");
      const { data, error } = await supabase
        .from("notifications")
        .insert([{ title, description }])
        .select()
        .single();
      if (error) throw error;
    },
    onSuccess: () => {
      setSuccess("Notification sent!");
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["notifications"]});
    },
    onError: (e: any) => {
      setError(e?.message || "Failed to send notification");
    },
  });

  return (
    <div className="max-w-md mx-auto pt-10">
      <h2 className="text-xl font-bold mb-4">Push Notification</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setSuccess(null);
          mutate();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send Notification"}
          </Button>
        </div>
        {success && <p className="text-green-600">{success}</p>}
        {error && <p className="text-destructive/80">{error}</p>}
      </form>
      <div className="mt-8 text-xs text-muted-foreground border-t pt-4">
        <p>
          <strong>Note:</strong> For demo purposes, any logged-in user can access this page as "admin".
          Implement stricter logic as needed!
        </p>
      </div>
    </div>
  );
};

export default AdminNotifications;
