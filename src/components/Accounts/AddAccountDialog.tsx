
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddAccountDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
  onAccountAdded: (account: any) => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, setOpen, userId, onAccountAdded }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'REAL' | 'DEMO'>('REAL');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({ name, type, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      onAccountAdded(data);
      toast({
        title: 'Account created',
        description: `Account "${name}" (${type}) created successfully.`,
      });
      setName('');
      setType('REAL');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Account Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Primary Account"
              required
              maxLength={50}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as 'REAL' | 'DEMO')} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REAL" id="real" />
                <label htmlFor="real">Real</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DEMO" id="demo" />
                <label htmlFor="demo">Demo</label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
