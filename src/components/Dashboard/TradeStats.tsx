
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, BarChart3, Percent, TrendingUp } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradeStatsProps {
  trades: Trade[];
}

const TradeStats: React.FC<TradeStatsProps> = ({ trades }) => {
  // Calculate stats
  const totalTrades = trades.length;
  
  const wins = trades.filter(trade => trade.result === 'WIN').length;
  const losses = trades.filter(trade => trade.result === 'LOSS').length;
  const breakEven = trades.filter(trade => trade.result === 'BREAK EVEN' || trade.is_break_even).length;
  
  // Win rate excludes break-even trades
  const tradesExcludingBreakEven = totalTrades - breakEven;
  const winRate = tradesExcludingBreakEven > 0 ? Math.round((wins / tradesExcludingBreakEven) * 100) : 0;
  
  // Calculate total and average P/L using the user's manually entered values
  const totalProfitLoss = trades.reduce((total, trade) => {
    return total + Number(trade.profit_loss);
  }, 0);
  
  const avgProfitLossNumber = totalTrades > 0 ? totalProfitLoss / totalTrades : 0;
  const avgProfitLoss = avgProfitLossNumber.toFixed(1);
  
  // Prepare chart data with enhanced styling
  const chartData = [
    { name: 'Wins', value: wins, fill: '#10b981' },
    { name: 'Losses', value: losses, fill: '#ef4444' },
    { name: 'Break Even', value: breakEven, fill: '#94a3b8' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Trades"
          value={totalTrades}
          icon={<ActivitySquare className="h-4 w-4" />}
          delay={100}
        />
        <StatsCard 
          title="Win Rate"
          value={`${winRate}%`}
          description={`${wins} wins out of ${tradesExcludingBreakEven} trades (excl. break-even)`}
          icon={<Percent className="h-4 w-4" />}
          delay={200}
        />
        <StatsCard 
          title="Average P/L"
          value={`${avgProfitLossNumber > 0 ? '+' : ''}${avgProfitLoss}`}
          description="Average profit/loss per trade"
          icon={<TrendingUp className="h-4 w-4" />}
          delay={300}
        />
        <StatsCard 
          title="Performance"
          value={winRate > 50 ? 'Profitable' : winRate > 40 ? 'Neutral' : 'Needs Work'}
          description={`Total P/L: ${totalProfitLoss > 0 ? '+' : ''}${totalProfitLoss.toFixed(1)}`}
          icon={<BarChart3 className="h-4 w-4" />}
          delay={400}
        />
      </div>
      
      {totalTrades > 0 && (
        <Card className="glass-card transform transition-all duration-500 opacity-0 translate-y-4 animate-fade-in hover:shadow-2xl" style={{animationDelay: '500ms'}}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Trade Results Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(12px)',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradeStats;
