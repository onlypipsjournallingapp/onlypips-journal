
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Pencil, FolderPlus, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChecklistInfo from "./ChecklistInfo";

interface Strategy {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface StrategyListProps {
  userId: string;
  selectedId?: string;
  onStrategySelect: (id: string) => void;
}

const StrategyList: React.FC<StrategyListProps> = ({
  userId,
  selectedId,
  onStrategySelect,
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all strategies for the user
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Error", description: "Could not fetch strategies.", variant: "destructive" });
      } else {
        setStrategies(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId, toast]);

  // Create new strategy
  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("strategies")
      .insert({ name: newName, user_id: userId })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Could not add strategy.", variant: "destructive" });
    } else if (data) {
      setStrategies((prev) => [data, ...prev]);
      setNewName("");
      onStrategySelect(data.id);
    }
    setLoading(false);
  };

  // Allow renaming a strategy
  const handleRename = async (id: string, name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from("strategies")
      .update({ name })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Rename failed.", variant: "destructive" });
    } else {
      setStrategies((list) =>
        list.map((s) => (s.id === id ? { ...s, name } : s))
      );
    }
    setLoading(false);
  };

  // Allow deleting a strategy
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this strategy and all its checklist items?")) return;
    setLoading(true);
    const { error } = await supabase
      .from("strategies")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } else {
      setStrategies((list) => list.filter((x) => x.id !== id));
      if (selectedId === id) onStrategySelect("");
    }
    setLoading(false);
  };

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  return (
    <div>
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          Strategies
          <ChecklistInfo />
        </h2>
      </div>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Strategy name (e.g., Legacy Strategy)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleAdd} disabled={!newName.trim() || loading} className="gap-1">
          <FolderPlus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {strategies.length === 0 ? (
          <div className="text-muted-foreground text-sm">No strategies yet.</div>
        ) : (
          strategies.map((strat) => (
            <Card
              key={strat.id}
              className={`transition border cursor-pointer ${
                strat.id === selectedId
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary"
              }`}
              onClick={() => onStrategySelect(strat.id)}
            >
              <CardHeader className="flex flex-row items-center space-y-0">
                <CardTitle className="flex-1 flex items-center">
                  <Folder className="h-4 w-4 text-accent mr-2" />
                  {editingId === strat.id ? (
                    <Input
                      className="bg-background"
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && editingName.trim()) {
                          await handleRename(strat.id, editingName);
                          setEditingId(null);
                        }
                      }}
                    />
                  ) : (
                    <span>{strat.name}</span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(strat.id);
                      setEditingName(strat.name);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(strat.id);
                    }}
                  >
                    <span className="sr-only">Delete</span>
                    ×
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StrategyList;
