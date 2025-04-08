
import React, { useEffect, useState } from 'react';
import TradeStats from '@/components/Dashboard/TradeStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle } from 'lucide-react';

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // This would be replaced with actual Supabase query
        console.log('Fetching trades for user:', userId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockTrades = [
          {
            id: '1',
            pair: 'EUR/USD',
            direction: 'BUY',
            entry_price: 1.0750,
            exit_price: 1.0820,
            result: 'WIN',
            notes: 'Strong trend following setup at support level.',
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
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        
        setTrades(mockTrades);
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrades();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            View your trading performance and statistics.
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      ) : (
        <>
          <TradeStats trades={trades} />
          
          {trades.length > 0 && (
            <div className="mt-8 animate-fade-in" style={{animationDelay: '800ms'}}>
              <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trades.slice(0, 3).map((trade: any) => (
                  <Card key={trade.id} className="glass-card card-animate">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{trade.pair}</CardTitle>
                        <div className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          trade.result === 'WIN' ? 'bg-profit/10 text-profit' : 
                          trade.result === 'LOSS' ? 'bg-loss/10 text-loss' : 
                          'bg-neutral/10 text-neutral'
                        }`}>
                          {trade.result}
                        </div>
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        {trade.direction === 'BUY' ? (
                          <ArrowUpCircle className="h-3 w-3 mr-1 text-profit" />
                        ) : (
                          <ArrowUpCircle className="h-3 w-3 mr-1 text-loss transform rotate-180" />
                        )}
                        {trade.direction}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        <div className="text-muted-foreground">Entry</div>
                        <div className="text-right">{trade.entry_price}</div>
                        <div className="text-muted-foreground">Exit</div>
                        <div className="text-right">{trade.exit_price}</div>
                      </div>
                      {trade.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                          {trade.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
