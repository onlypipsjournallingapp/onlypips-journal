
import React, { useState, useEffect } from 'react';
import TradeForm from '@/components/Trades/TradeForm';
import TradeList from '@/components/Trades/TradeList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        // This would be replaced with actual Supabase query
        console.log('Fetching trades for user:', userId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - same as in Dashboard
        const mockTrades = [
          {
            id: '1',
            pair: 'EUR/USD',
            direction: 'BUY',
            entry_price: 1.0750,
            exit_price: 1.0820,
            result: 'WIN',
            notes: 'Strong trend following setup at support level.',
            screenshot_url: 'https://i.imgur.com/knUNqgB.png',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            pair: 'GBP/USD',
            direction: 'SELL',
            entry_price: 1.2650,
            exit_price: 1.2610,
            result: 'WIN',
            notes: 'Bearish rejection at resistance.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            pair: 'USD/JPY',
            direction: 'BUY',
            entry_price: 149.50,
            exit_price: 148.90,
            result: 'LOSS',
            notes: 'Failed breakout trade. Momentum lost after entry.',
            screenshot_url: 'https://i.imgur.com/NrRd85l.png',
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        
        setTrades(mockTrades);
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
      // This would be replaced with actual Supabase insert
      console.log('Submitting trade:', { userId, ...tradeData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new trade with mock data
      const newTrade = {
        id: Date.now().toString(),
        ...tradeData,
        screenshot_url: tradeData.screenshot ? URL.createObjectURL(tradeData.screenshot) : undefined,
        created_at: new Date().toISOString(),
      };
      
      // Update local state
      setTrades([newTrade, ...trades]);
      
      return newTrade;
    } catch (error) {
      console.error('Error submitting trade:', error);
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
