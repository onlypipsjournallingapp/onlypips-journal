
import React, { useState, useEffect } from 'react';
import TradeForm from '@/components/Trades/TradeForm';
import TradeList from '@/components/Trades/TradeList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

interface TradesProps {
  userId: string;
}

// Define trade type based on the database schema
type Trade = Database['public']['Tables']['trades']['Row'];
type Account = Database['public']['Tables']['accounts']['Row'];

const Trades: React.FC<TradesProps> = ({ userId }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountsAndTrades = async () => {
      setIsLoading(true);
      const [{ data: accs, error: accErr }, { data, error }] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", userId).order("created_at"),
        supabase.from('trades').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);
      setAccounts(accs || []);
      setSelectedAccountId((accs && accs.length > 0) ? accs[0].id : null);
      setTrades(data || []);
      setIsLoading(false);
      if (accErr) console.error(accErr);
      if (error) console.error(error);
    };
    fetchAccountsAndTrades();
  }, [userId]);

  const handleSubmitTrade = async (tradeData: any) => {
    try {
      if (!selectedAccountId) throw new Error("Please select an account first.");
      const newTradeData = {
        user_id: userId,
        pair: tradeData.pair,
        direction: tradeData.direction,
        entry_price: tradeData.entry_price || null,
        exit_price: tradeData.exit_price || null,
        profit_loss: tradeData.is_break_even ? 0 : parseFloat(tradeData.profit_loss),
        result: tradeData.is_break_even ? 'BREAK EVEN' : 
                parseFloat(tradeData.profit_loss) > 0 ? 'WIN' : 'LOSS',
        is_break_even: tradeData.is_break_even || false,
        notes: tradeData.notes || null,
        trade_type: tradeData.trade_type,
        account_id: selectedAccountId
      };
      // Insert new trade into Supabase
      const { data, error } = await supabase
        .from('trades')
        .insert(newTradeData)
        .select()
        .single();
      if (error) throw error;
      // If there's a screenshot, upload it
      let screenshotUrl = null;
      if (tradeData.screenshot && data) {
        const fileExt = tradeData.screenshot.name.split('.').pop();
        const fileName = `${userId}/${data.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('trades')
          .upload(fileName, tradeData.screenshot);
        if (uploadError) throw uploadError;
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('trades')
          .getPublicUrl(fileName);
        screenshotUrl = publicUrl;
        // Update the trade with screenshot URL
        if (screenshotUrl) {
          const { error: updateError } = await supabase
            .from('trades')
            .update({ screenshot_url: screenshotUrl })
            .eq('id', data.id);
          if (updateError) throw updateError;
        }
      }
      const finalTrade = {
        ...data,
        screenshot_url: screenshotUrl
      } as Trade;
      setTrades([finalTrade, ...trades]);
      toast({
        title: "Trade Added",
        description: "Your trade has been successfully recorded.",
      });
      return finalTrade;
    } catch (error) {
      console.error('Error submitting trade:', error);
      toast({
        title: "Error",
        description: "Failed to add trade. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trades</h1>
        <p className="text-muted-foreground">
          Log and review your trading activity. Choose an account to view/add trades.
        </p>
        <div className="mb-4 mt-4">
          <label className="font-medium mr-1">Select Account:</label>
          <select
            className="border px-3 py-1 rounded bg-background"
            value={selectedAccountId || ''}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>
      </div>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Trade Log</TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-1" />
            Add Trade
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-primary">Loading...</div>
            </div>
          ) : (
            <TradeList
              trades={trades.filter(tr => tr.account_id === selectedAccountId)}
            />
          )}
        </TabsContent>
        <TabsContent value="add">
          <TradeForm onSubmit={handleSubmitTrade} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Trades;
