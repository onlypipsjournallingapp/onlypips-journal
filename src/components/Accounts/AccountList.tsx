
import React from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Account = Database['public']['Tables']['accounts']['Row'];

interface Props {
  accounts: Account[];
  onAccountDeleted: (accountId: string) => void;
}

const AccountList: React.FC<Props> = ({ accounts, onAccountDeleted }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    console.log('Starting deletion for account:', accountId, accountName);
    
    try {
      // Delete the account from the database
      const { error, data } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .select(); // Add select to get confirmation of what was deleted

      console.log('Delete operation result:', { error, data });

      if (error) {
        console.error('Supabase delete error:', error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if any rows were actually deleted
      if (!data || data.length === 0) {
        console.warn('No rows were deleted - account may not exist');
        toast({
          title: "Warning",
          description: "Account may have already been deleted.",
          variant: "destructive",
        });
        return;
      }

      console.log('Account successfully deleted from database');
      
      toast({
        title: "Account deleted",
        description: `Account "${accountName}" has been deleted successfully.`,
      });

      // Update the local state
      onAccountDeleted(accountId);
      console.log('Local state updated');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!accounts.length) {
    return (
      <div className="text-center text-muted-foreground">
        No accounts yet. Get started by adding a new account!
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      {accounts.map((acc) => (
        <Card 
          key={acc.id} 
          className="p-4 flex justify-between items-center hover:bg-muted/50 transition"
        >
          <div 
            className="flex-1 cursor-pointer"
            onClick={() =>
              navigate(`/dashboard/${acc.type.toLowerCase()}/${encodeURIComponent(acc.name)}`)
            }
          >
            <div className="font-semibold">{acc.name}</div>
            <div className="text-xs text-muted-foreground uppercase">{acc.type}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() =>
                navigate(`/dashboard/${acc.type.toLowerCase()}/${encodeURIComponent(acc.name)}`)
              }
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the account "{acc.name}"? This action cannot be undone and will permanently remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteAccount(acc.id, acc.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AccountList;
