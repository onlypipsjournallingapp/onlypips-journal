
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, BarChart3, Percent, TrendingUp } from 'lucide-react';

interface Trade {
  result: 'WIN' | 'LOSS' | 'BREAK EVEN';
  entry_price: number;
  exit_price: number;
  direction: 'BUY' | 'SELL';
}

interface TradeStatsProps {
  trades: Trade[];
}

const TradeStats: React.FC<TradeStatsProps> = ({ trades }) => {
  // Calculate stats
  const totalTrades = trades.length;
  
  const wins = trades.filter(trade => trade.result === 'WIN').length;
  const losses = trades.filter(trade => trade.result === 'LOSS').length;
  const breakEven = trades.filter(trade => trade.result === 'BREAK EVEN').length;
  
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  
  // Calculate average profit/loss
  const getPipsDifference = (trade: Trade) => {
    const diff = Math.abs(trade.exit_price - trade.entry_price);
    // For forex pairs, multiply by 10000 to get pips
    // This is a simplification - in real app we'd need to know the pair to calculate pips correctly
    return diff * 10000;
  };
  
  const totalPips = trades.reduce((total, trade) => {
    const pips = getPipsDifference(trade);
    if (trade.result === 'WIN') return total + pips;
    if (trade.result === 'LOSS') return total - pips;
    return total;
  }, 0);
  
  const avgPipsNumber = totalTrades > 0 ? totalPips / totalTrades : 0;
  const avgPips = avgPipsNumber.toFixed(1);
  
  // Prepare chart data
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
          description={`${wins} wins out of ${totalTrades} trades`}
          icon={<Percent className="h-4 w-4" />}
          delay={200}
        />
        <StatsCard 
          title="Average P/L"
          value={`${avgPipsNumber > 0 ? '+' : ''}${avgPips}`}
          description="Average pips per trade"
          icon={<TrendingUp className="h-4 w-4" />}
          delay={300}
        />
        <StatsCard 
          title="Performance"
          value={winRate > 50 ? 'Profitable' : winRate > 40 ? 'Neutral' : 'Needs Work'}
          description={`Total P/L: ${totalPips > 0 ? '+' : ''}${totalPips.toFixed(1)} pips`}
          icon={<BarChart3 className="h-4 w-4" />}
          delay={400}
        />
      </div>
      
      {totalTrades > 0 && (
        <Card className="glass-card transform transition-all duration-500 opacity-0 translate-y-4 animate-fade-in" style={{animationDelay: '500ms'}}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Trade Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                  <Bar dataKey="value" />
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
