
import React from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

type Account = Database['public']['Tables']['accounts']['Row'];

interface Props {
  accounts: Account[];
}

const AccountList: React.FC<Props> = ({ accounts }) => {
  const navigate = useNavigate();
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
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition"
          onClick={() =>
            navigate(`/dashboard/${acc.type.toLowerCase()}/${encodeURIComponent(acc.name)}`)
          }
        >
          <div>
            <div className="font-semibold">{acc.name}</div>
            <div className="text-xs text-muted-foreground uppercase">{acc.type}</div>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Card>
      ))}
    </div>
  );
};

export default AccountList;
