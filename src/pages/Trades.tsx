
import React, { useState, useEffect } from 'react';
import TradeForm from '@/components/Trades/TradeForm';
import TradeList from '@/components/Trades/TradeList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TradesProps {
  userId: string;
}

const Trades: React.FC<TradesProps> = ({ userId }) => {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trades from Supabase
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setTrades(data || []);
      } catch (error) {
        console.error('Error fetching trades:', error);
        toast({
          title: "Error",
          description: "Failed to fetch trades. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrades();
  }, [userId, toast]);
  
  const handleSubmitTrade = async (tradeData: any) => {
    try {
      // Prepare the trade data for Supabase
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
        notes: tradeData.notes || null
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
        
        const { error: uploadError, data: uploadData } = await supabase.storage
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
      
      // Get the final trade with screenshot URL if applicable
      const finalTrade = {
        ...data,
        screenshot_url: screenshotUrl
      };
      
      // Update local state
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
          Log and review your trading activity.
        </p>
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
            <TradeList trades={trades} />
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
