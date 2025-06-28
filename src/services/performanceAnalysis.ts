
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];
type Strategy = Database['public']['Tables']['strategies']['Row'];

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  totalProfitLoss: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  averageHoldingTime: number;
  strategyPerformance: StrategyPerformance[];
  monthlyPerformance: MonthlyPerformance[];
  riskRewardAnalysis: RiskRewardAnalysis;
  performanceLabel: PerformanceLabel;
  insights: string[];
}

export interface StrategyPerformance {
  strategyId: string;
  strategyName: string;
  trades: number;
  winRate: number;
  totalProfitLoss: number;
  averageRR: number;
}

export interface MonthlyPerformance {
  month: string;
  trades: number;
  profitLoss: number;
  winRate: number;
}

export interface RiskRewardAnalysis {
  averageRR: number;
  tradesWithRR: number;
  rrDistribution: { range: string; count: number }[];
}

export type PerformanceLabel = 'Excellent' | 'Consistent' | 'Improving' | 'Volatile' | 'Declining';

export class PerformanceAnalysisService {
  static async analyzeUserPerformance(userId: string): Promise<PerformanceMetrics> {
    // Fetch user's trades and strategies
    const [{ data: trades }, { data: strategies }] = await Promise.all([
      supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('strategies')
        .select('*')
        .eq('user_id', userId)
    ]);

    if (!trades || trades.length === 0) {
      return this.getEmptyMetrics();
    }

    const metrics = this.calculateMetrics(trades as Trade[], strategies as Strategy[] || []);
    
    // Cache the results
    await this.cacheResults(userId, metrics);
    
    return metrics;
  }

  private static calculateMetrics(trades: Trade[], strategies: Strategy[]): PerformanceMetrics {
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.result === 'WIN');
    const losses = trades.filter(t => t.result === 'LOSS');
    const winRate = (wins.length / totalTrades) * 100;
    
    const totalProfitLoss = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const totalWins = wins.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + (t.profit_loss || 0), 0));
    
    const averageWin = wins.length > 0 ? totalWins / wins.length : 0;
    const averageLoss = losses.length > 0 ? totalLosses / losses.length : 0;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    
    const tradesWithHolding = trades.filter(t => t.holding_duration_minutes);
    const averageHoldingTime = tradesWithHolding.length > 0 
      ? tradesWithHolding.reduce((sum, t) => sum + (t.holding_duration_minutes || 0), 0) / tradesWithHolding.length
      : 0;

    const strategyPerformance = this.calculateStrategyPerformance(trades, strategies);
    const monthlyPerformance = this.calculateMonthlyPerformance(trades);
    const riskRewardAnalysis = this.calculateRiskRewardAnalysis(trades);
    const performanceLabel = this.determinePerformanceLabel(trades, winRate, totalProfitLoss, profitFactor);
    const insights = this.generateInsights(trades, strategyPerformance, winRate, profitFactor);

    return {
      totalTrades,
      winRate,
      totalProfitLoss,
      averageWin,
      averageLoss,
      profitFactor,
      averageHoldingTime,
      strategyPerformance,
      monthlyPerformance,
      riskRewardAnalysis,
      performanceLabel,
      insights
    };
  }

  private static calculateStrategyPerformance(trades: Trade[], strategies: Strategy[]): StrategyPerformance[] {
    const strategyMap = new Map(strategies.map(s => [s.id, s.name]));
    const strategyTrades = new Map<string, Trade[]>();

    trades.forEach(trade => {
      if (trade.strategy_used) {
        if (!strategyTrades.has(trade.strategy_used)) {
          strategyTrades.set(trade.strategy_used, []);
        }
        strategyTrades.get(trade.strategy_used)!.push(trade);
      }
    });

    return Array.from(strategyTrades.entries()).map(([strategyId, strategyTradeList]) => {
      const wins = strategyTradeList.filter(t => t.result === 'WIN');
      const winRate = (wins.length / strategyTradeList.length) * 100;
      const totalProfitLoss = strategyTradeList.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const tradesWithRR = strategyTradeList.filter(t => t.risk_reward_ratio);
      const averageRR = tradesWithRR.length > 0 
        ? tradesWithRR.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / tradesWithRR.length
        : 0;

      return {
        strategyId,
        strategyName: strategyMap.get(strategyId) || 'Unknown Strategy',
        trades: strategyTradeList.length,
        winRate,
        totalProfitLoss,
        averageRR
      };
    }).sort((a, b) => b.totalProfitLoss - a.totalProfitLoss);
  }

  private static calculateMonthlyPerformance(trades: Trade[]): MonthlyPerformance[] {
    const monthlyMap = new Map<string, Trade[]>();

    trades.forEach(trade => {
      const month = new Date(trade.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, []);
      }
      monthlyMap.get(month)!.push(trade);
    });

    return Array.from(monthlyMap.entries()).map(([month, monthTrades]) => {
      const wins = monthTrades.filter(t => t.result === 'WIN');
      const winRate = (wins.length / monthTrades.length) * 100;
      const profitLoss = monthTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

      return {
        month,
        trades: monthTrades.length,
        profitLoss,
        winRate
      };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }

  private static calculateRiskRewardAnalysis(trades: Trade[]): RiskRewardAnalysis {
    const tradesWithRR = trades.filter(t => t.risk_reward_ratio && t.risk_reward_ratio > 0);
    const averageRR = tradesWithRR.length > 0 
      ? tradesWithRR.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / tradesWithRR.length
      : 0;

    const rrRanges = [
      { range: '0-1', min: 0, max: 1 },
      { range: '1-2', min: 1, max: 2 },
      { range: '2-3', min: 2, max: 3 },
      { range: '3+', min: 3, max: Infinity }
    ];

    const rrDistribution = rrRanges.map(range => ({
      range: range.range,
      count: tradesWithRR.filter(t => 
        (t.risk_reward_ratio || 0) >= range.min && (t.risk_reward_ratio || 0) < range.max
      ).length
    }));

    return {
      averageRR,
      tradesWithRR: tradesWithRR.length,
      rrDistribution
    };
  }

  private static determinePerformanceLabel(
    trades: Trade[], 
    winRate: number, 
    totalProfitLoss: number, 
    profitFactor: number
  ): PerformanceLabel {
    const recentTrades = trades.slice(-20); // Last 20 trades
    const recentPL = recentTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const recentWinRate = recentTrades.length > 0 
      ? (recentTrades.filter(t => t.result === 'WIN').length / recentTrades.length) * 100
      : 0;

    // Excellent: High win rate, positive P/L, good profit factor
    if (winRate >= 60 && totalProfitLoss > 0 && profitFactor >= 1.5) {
      return 'Excellent';
    }

    // Consistent: Steady performance with positive results
    if (winRate >= 45 && totalProfitLoss > 0 && profitFactor >= 1.2) {
      return 'Consistent';
    }

    // Improving: Recent performance better than overall
    if (recentPL > 0 && recentWinRate > winRate) {
      return 'Improving';
    }

    // Volatile: Inconsistent results
    if (Math.abs(totalProfitLoss) / trades.length > 50) {
      return 'Volatile';
    }

    // Declining: Recent performance worse than overall or negative trend
    if (recentPL < 0 || totalProfitLoss < 0) {
      return 'Declining';
    }

    return 'Consistent';
  }

  private static generateInsights(
    trades: Trade[], 
    strategyPerformance: StrategyPerformance[], 
    winRate: number, 
    profitFactor: number
  ): string[] {
    const insights: string[] = [];

    // Best strategy insight
    if (strategyPerformance.length > 0) {
      const bestStrategy = strategyPerformance[0];
      insights.push(`Your best performing strategy is "${bestStrategy.strategyName}" with ${bestStrategy.trades} trades and a ${bestStrategy.winRate.toFixed(1)}% win rate.`);
    }

    // Win rate insight
    if (winRate >= 60) {
      insights.push(`Excellent win rate of ${winRate.toFixed(1)}%! You're showing strong trade selection skills.`);
    } else if (winRate < 40) {
      insights.push(`Your win rate of ${winRate.toFixed(1)}% suggests room for improvement in trade selection or entry timing.`);
    }

    // Profit factor insight
    if (profitFactor >= 2) {
      insights.push(`Outstanding profit factor of ${profitFactor.toFixed(2)}! Your winning trades significantly outweigh your losses.`);
    } else if (profitFactor < 1) {
      insights.push(`Your profit factor of ${profitFactor.toFixed(2)} indicates your losses are larger than your wins. Consider improving risk management.`);
    }

    // Risk management insight
    const tradesWithRR = trades.filter(t => t.risk_reward_ratio && t.risk_reward_ratio > 0);
    if (tradesWithRR.length < trades.length * 0.5) {
      insights.push(`Consider tracking risk-reward ratios more consistently to improve your risk management analysis.`);
    }

    return insights;
  }

  private static async cacheResults(userId: string, metrics: PerformanceMetrics): Promise<void> {
    try {
      const reportData = {
        user_id: userId,
        report_data: metrics,
        performance_label: metrics.performanceLabel,
        trades_analyzed: metrics.totalTrades
      };

      // Check if report exists and update, otherwise insert
      const { data: existing } = await supabase
        .from('user_performance_reports')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        await supabase
          .from('user_performance_reports')
          .update(reportData)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_performance_reports')
          .insert(reportData);
      }
    } catch (error) {
      console.error('Error caching performance report:', error);
    }
  }

  private static getEmptyMetrics(): PerformanceMetrics {
    return {
      totalTrades: 0,
      winRate: 0,
      totalProfitLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      averageHoldingTime: 0,
      strategyPerformance: [],
      monthlyPerformance: [],
      riskRewardAnalysis: {
        averageRR: 0,
        tradesWithRR: 0,
        rrDistribution: []
      },
      performanceLabel: 'Consistent',
      insights: ['Start trading to generate your performance insights!']
    };
  }
}
