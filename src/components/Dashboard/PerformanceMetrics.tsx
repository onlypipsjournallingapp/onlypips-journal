
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface PerformanceMetricsProps {
  trades: Trade[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ trades }) => {
  // Advanced metrics calculations
  const winningTrades = trades.filter(trade => Number(trade.profit_loss) > 0);
  const losingTrades = trades.filter(trade => Number(trade.profit_loss) < 0);
  
  const totalPnL = trades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0);
  const totalWins = winningTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0));
  
  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 3 : 0;
  
  // Sharpe ratio approximation (simplified)
  const returns = trades.map(trade => Number(trade.profit_loss));
  const avgReturn = returns.length > 0 ? returns.reduce((sum, ret) => sum + ret, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
  
  // Maximum drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;
  
  trades.forEach(trade => {
    runningPnL += Number(trade.profit_loss);
    if (runningPnL > peak) peak = runningPnL;
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  
  const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;
  
  // Fixed consistency score calculation
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const profitFactorScore = Math.min(profitFactor * 20, 40); // Max 40 points
  const drawdownScore = Math.max(30 - maxDrawdownPercent, 0); // Max 30 points, penalty for high drawdown
  const winRateScore = winRate * 0.3; // Max 30 points (100% win rate * 0.3)
  
  const consistencyScore = Math.min(Math.max(profitFactorScore + drawdownScore + winRateScore, 0), 100);
  
  // Risk-adjusted return
  const riskAdjustedReturn = maxDrawdown > 0 ? totalPnL / maxDrawdown : totalPnL;

  const metrics = [
    {
      label: "Profit Factor",
      value: profitFactor.toFixed(2),
      target: 1.5,
      current: Math.min(profitFactor, 3),
      description: "Ratio of gross profit to gross loss",
      status: profitFactor > 1.5 ? "excellent" : profitFactor > 1.2 ? "good" : profitFactor > 1 ? "fair" : "poor"
    },
    {
      label: "Sharpe Ratio",
      value: sharpeRatio.toFixed(2),
      target: 1.0,
      current: Math.min(Math.max(sharpeRatio + 1, 0), 2),
      description: "Risk-adjusted return measure",
      status: sharpeRatio > 1 ? "excellent" : sharpeRatio > 0.5 ? "good" : sharpeRatio > 0 ? "fair" : "poor"
    },
    {
      label: "Max Drawdown",
      value: `${maxDrawdownPercent.toFixed(1)}%`,
      target: 20,
      current: Math.max(20 - Math.min(maxDrawdownPercent, 20), 0),
      description: "Largest peak-to-trough decline",
      status: maxDrawdownPercent < 10 ? "excellent" : maxDrawdownPercent < 20 ? "good" : maxDrawdownPercent < 30 ? "fair" : "poor"
    },
    {
      label: "Consistency Score",
      value: `${Math.round(consistencyScore)}%`,
      target: 100,
      current: consistencyScore,
      description: "Overall trading consistency based on win rate, profit factor, and drawdown",
      status: consistencyScore > 80 ? "excellent" : consistencyScore > 60 ? "good" : consistencyScore > 40 ? "fair" : "poor"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-blue-500";
      case "fair": return "bg-yellow-500";
      case "poor": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      excellent: "bg-green-500/10 text-green-500 border-green-500/20",
      good: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      fair: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      poor: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return colors[status as keyof typeof colors] || colors.poor;
  };

  // Debug logging for consistency score
  console.log('Consistency Score Debug:', {
    winRate,
    profitFactorScore,
    drawdownScore,
    winRateScore,
    consistencyScore,
    trades: trades.length,
    winningTrades: winningTrades.length
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map((metric, index) => (
        <Card 
          key={metric.label}
          className="glass-card hover:shadow-2xl transition-all duration-500 group"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{metric.label}</CardTitle>
              <Badge 
                variant="outline" 
                className={`${getStatusBadge(metric.status)} border text-xs font-medium px-2 py-1`}
              >
                {metric.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {metric.value}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Performance</span>
                  <span>{((metric.current / metric.target) * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={(metric.current / metric.target) * 100} 
                  className={`h-3 bg-muted/30 overflow-hidden`}
                />
                <div className={`h-3 rounded-full ${getStatusColor(metric.status)} transition-all duration-1000`} 
                     style={{ 
                       width: `${Math.min((metric.current / metric.target) * 100, 100)}%`,
                       background: `linear-gradient(90deg, ${
                         metric.status === 'excellent' ? '#10b981, #059669' :
                         metric.status === 'good' ? '#3b82f6, #2563eb' :
                         metric.status === 'fair' ? '#f59e0b, #d97706' :
                         '#ef4444, #dc2626'
                       })`,
                       boxShadow: `0 0 20px ${
                         metric.status === 'excellent' ? '#10b98150' :
                         metric.status === 'good' ? '#3b82f650' :
                         metric.status === 'fair' ? '#f59e0b50' :
                         '#ef444450'
                       }`
                     }} 
                />
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {metric.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Summary card */}
      <Card className="md:col-span-2 glass-card border-2 border-gradient-to-r from-purple-500/20 to-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Advanced Analytics Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{avgWin.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Avg Win</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{avgLoss.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Avg Loss</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{riskAdjustedReturn.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Risk-Adj Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{winRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;
