
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Check, Pencil, FileText, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  content: string;
  is_checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

interface StrategyChecklistProps {
  strategyId: string;
}

const StrategyChecklist: React.FC<StrategyChecklistProps> = ({ strategyId }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!strategyId) return;
    setLoading(true);
    supabase
      .from("strategy_checklist_items")
      .select("*")
      .eq("strategy_id", strategyId)
      .order("position", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Error", description: "Could not fetch checklist.", variant: "destructive" });
        }
        setItems(data || []);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [strategyId]);

  // Add checklist item
  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("strategy_checklist_items")
      .insert({
        strategy_id: strategyId,
        content: newItem,
        position: items.length,
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to add item.", variant: "destructive" });
    } else if (data) {
      setItems((prev) => [...prev, data]);
      setNewItem("");
    }
    setLoading(false);
  };

  // Toggle check
  const handleToggle = async (item: ChecklistItem) => {
    const { data, error } = await supabase
      .from("strategy_checklist_items")
      .update({ is_checked: !item.is_checked })
      .eq("id", item.id)
      .select()
      .single();
    if (!error && data) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_checked: data.is_checked } : i))
      );
    }
  };

  // Edit item content
  const handleRename = async (item: ChecklistItem, newContent: string) => {
    if (!newContent.trim()) return;
    const { error } = await supabase
      .from("strategy_checklist_items")
      .update({ content: newContent })
      .eq("id", item.id);
    if (!error) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, content: newContent } : i))
      );
    }
  };

  // Delete item
  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Delete this checklist item?")) return;
    const { error } = await supabase
      .from("strategy_checklist_items")
      .delete()
      .eq("id", itemId);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  // Inline edit
  const [editing, setEditing] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  return (
    <Card className="mt-4">
      <CardHeader>
        <h3 className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" /> Strategy Checklist
        </h3>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex gap-2 mb-4"
        >
          <Input
            placeholder="Add checklist item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={!newItem.trim() || loading}>
            <FileIcon className="h-4 w-4 mr-1" />
            Add
          </Button>
        </form>
        <ul className="space-y-2">
          {items.length === 0 && <li className="text-muted-foreground text-sm">No items yet.</li>}
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 group">
              <div
                className={`flex items-center gap-2 flex-1 cursor-pointer ${
                  item.is_checked ? "line-through text-muted-foreground" : ""
                }`}
                onClick={() => handleToggle(item)}
              >
                <Button
                  variant={item.is_checked ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7"
                  tabIndex={-1}
                >
                  <Check className={`h-4 w-4 ${item.is_checked ? "text-green-600" : ""}`} />
                </Button>
                {editing === item.id ? (
                  <Input
                    className="bg-background"
                    autoFocus
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onBlur={() => {
                      setEditing(null);
                      setEditingContent("");
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && editingContent.trim()) {
                        await handleRename(item, editingContent);
                        setEditing(null);
                      }
                    }}
                  />
                ) : (
                  <span>{item.content}</span>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditing(item.id);
                    setEditingContent(item.content);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7"
                  onClick={() => handleDelete(item.id)}
                >
                  <span className="sr-only">Delete</span>
                  ×
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default StrategyChecklist;
