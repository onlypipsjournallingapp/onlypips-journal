
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Zap, BarChart3, Calendar, Clock, DollarSign } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface MetricsGridProps {
  trades: Trade[];
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ trades }) => {
  // Advanced calculations
  const totalTrades = trades.length;
  const wins = trades.filter(trade => trade.result === 'WIN').length;
  const losses = trades.filter(trade => trade.result === 'LOSS').length;
  const breakEven = trades.filter(trade => trade.result === 'BREAK EVEN' || trade.is_break_even).length;
  
  const tradesExcludingBreakEven = totalTrades - breakEven;
  const winRate = tradesExcludingBreakEven > 0 ? (wins / tradesExcludingBreakEven) * 100 : 0;
  
  const totalPnL = trades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0);
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
  
  // Risk metrics
  const winningTrades = trades.filter(trade => Number(trade.profit_loss) > 0);
  const losingTrades = trades.filter(trade => Number(trade.profit_loss) < 0);
  
  const avgWin = winningTrades.length > 0 ? 
    winningTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? 
    Math.abs(losingTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0) / losingTrades.length) : 0;
  
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  
  // Recent performance (last 10 trades)
  const recentTrades = trades.slice(0, 10);
  const recentWins = recentTrades.filter(trade => trade.result === 'WIN').length;
  const recentWinRate = recentTrades.length > 0 ? (recentWins / recentTrades.length) * 100 : 0;

  const metrics = [
    {
      title: "Total Profit/Loss",
      value: `${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}`,
      icon: <DollarSign className="h-5 w-5" />,
      change: totalPnL >= 0 ? "+12.5%" : "-8.2%",
      positive: totalPnL >= 0,
      gradient: totalPnL >= 0 ? "from-green-500 to-emerald-600" : "from-red-500 to-rose-600"
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: <Target className="h-5 w-5" />,
      change: winRate > 50 ? "Above Average" : "Below Average",
      positive: winRate > 50,
      gradient: winRate > 50 ? "from-blue-500 to-cyan-600" : "from-orange-500 to-amber-600"
    },
    {
      title: "Profit Factor",
      value: profitFactor.toFixed(2),
      icon: <BarChart3 className="h-5 w-5" />,
      change: profitFactor > 1 ? "Profitable" : "Needs Work",
      positive: profitFactor > 1,
      gradient: profitFactor > 1 ? "from-purple-500 to-violet-600" : "from-red-500 to-pink-600"
    },
    {
      title: "Recent Form",
      value: `${recentWinRate.toFixed(0)}%`,
      icon: <Zap className="h-5 w-5" />,
      change: `Last ${recentTrades.length} trades`,
      positive: recentWinRate > 50,
      gradient: recentWinRate > 50 ? "from-teal-500 to-cyan-600" : "from-slate-500 to-gray-600"
    },
    {
      title: "Average Win",
      value: `+${avgWin.toFixed(2)}`,
      icon: <TrendingUp className="h-5 w-5" />,
      change: "Per winning trade",
      positive: true,
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Average Loss",
      value: `-${avgLoss.toFixed(2)}`,
      icon: <TrendingDown className="h-5 w-5" />,
      change: "Per losing trade",
      positive: false,
      gradient: "from-red-500 to-rose-600"
    },
    {
      title: "Total Trades",
      value: totalTrades.toString(),
      icon: <Calendar className="h-5 w-5" />,
      change: "All time",
      positive: true,
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      title: "Avg Per Trade",
      value: `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}`,
      icon: <Clock className="h-5 w-5" />,
      change: "Expected value",
      positive: avgPnL >= 0,
      gradient: avgPnL >= 0 ? "from-emerald-500 to-green-600" : "from-rose-500 to-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card 
          key={metric.title}
          className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm border border-white/10 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2"
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.gradient} text-white shadow-lg`}>
              {metric.icon}
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {metric.value}
            </div>
            <p className={`text-xs flex items-center gap-1 ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
              {metric.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {metric.change}
            </p>
            
            {metric.title === "Win Rate" && (
              <div className="mt-3">
                <Progress 
                  value={winRate} 
                  className="h-2 bg-muted/30"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsGrid;
