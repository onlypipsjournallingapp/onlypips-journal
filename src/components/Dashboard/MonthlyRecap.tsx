
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface MonthlyRecapProps {
  trades: Trade[];
}

const MonthlyRecap: React.FC<MonthlyRecapProps> = ({ trades }) => {
  // Generate list of available months from trades
  const availableMonths = React.useMemo(() => {
    const monthsSet = new Set<string>();
    
    trades.forEach(trade => {
      const tradeDate = new Date(trade.created_at);
      const monthYear = tradeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthsSet.add(monthYear);
    });
    
    // Add current month even if no trades
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthsSet.add(currentMonth);
    
    return Array.from(monthsSet).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [trades]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  // Filter trades for selected month
  const selectedMonthTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.created_at);
    const tradeMonth = tradeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return tradeMonth === selectedMonth;
  });

  // Calculate monthly metrics
  const totalTrades = selectedMonthTrades.length;
  const wins = selectedMonthTrades.filter(trade => trade.result === 'WIN').length;
  const losses = selectedMonthTrades.filter(trade => trade.result === 'LOSS').length;
  const breakEven = selectedMonthTrades.filter(trade => trade.result === 'BREAK EVEN' || trade.is_break_even).length;
  
  const tradesExcludingBreakEven = totalTrades - breakEven;
  const winRate = tradesExcludingBreakEven > 0 ? Math.round((wins / tradesExcludingBreakEven) * 100) : 0;
  
  const totalPnL = selectedMonthTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0);
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;

  // Get best and worst trades
  const bestTrade = selectedMonthTrades.reduce((best, trade) => 
    Number(trade.profit_loss) > Number(best?.profit_loss || -Infinity) ? trade : best, 
    null as Trade | null
  );
  
  const worstTrade = selectedMonthTrades.reduce((worst, trade) => 
    Number(trade.profit_loss) < Number(worst?.profit_loss || Infinity) ? trade : worst, 
    null as Trade | null
  );

  const getPerformanceStatus = () => {
    if (totalPnL > 0) return { label: 'Profitable', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    if (totalPnL === 0) return { label: 'Break Even', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    return { label: 'Loss', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
  };

  const performanceStatus = getPerformanceStatus();

  if (totalTrades === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Monthly Recap
              </CardTitle>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trades recorded for {selectedMonth}.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Monthly Recap
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className={`${performanceStatus.color} border font-medium`}>
              {performanceStatus.label}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Showing stats for {selectedMonth}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-card/50 rounded-lg border border-white/5">
            <div className="text-2xl font-bold text-blue-500">{totalTrades}</div>
            <div className="text-xs text-muted-foreground">Total Trades</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border border-white/5">
            <div className="text-2xl font-bold text-green-500">{winRate}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border border-white/5">
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Total P/L</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border border-white/5">
            <div className={`text-2xl font-bold ${avgPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {avgPnL >= 0 ? '+' : ''}{avgPnL.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Avg P/L</div>
          </div>
        </div>

        {/* Trade Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-lg font-bold text-green-500">{wins}</span>
            </div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-lg font-bold text-red-500">{losses}</span>
            </div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          <div className="text-center p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-lg font-bold text-gray-500">{breakEven}</span>
            </div>
            <div className="text-xs text-muted-foreground">Break Even</div>
          </div>
        </div>

        {/* Best and Worst Trades */}
        {(bestTrade || worstTrade) && (
          <div className="grid md:grid-cols-2 gap-4">
            {bestTrade && Number(bestTrade.profit_loss) > 0 && (
              <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Best Trade</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{bestTrade.pair} - {bestTrade.direction}</div>
                  <div className="font-bold text-green-500">
                    +{Number(bestTrade.profit_loss).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
            
            {worstTrade && Number(worstTrade.profit_loss) < 0 && (
              <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">Worst Trade</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{worstTrade.pair} - {worstTrade.direction}</div>
                  <div className="font-bold text-red-500">
                    {Number(worstTrade.profit_loss).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyRecap;
