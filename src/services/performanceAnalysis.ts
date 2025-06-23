
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];
type Strategy = Database['public']['Tables']['strategies']['Row'];

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  avgRiskReward: number;
  profitFactor: number;
  avgHoldingTime: number;
  performanceLabel: PerformanceLabel;
  strategyPerformance: Array<{
    strategyId: string;
    strategyName: string;
    trades: number;
    winRate: number;
    totalPnL: number;
    avgRR: number;
  }>;
  monthlyPerformance: Array<{
    month: string;
    trades: number;
    winRate: number;
    pnl: number;
  }>;
  checklistCorrelation: {
    withChecklist: { trades: number; winRate: number };
    withoutChecklist: { trades: number; winRate: number };
  };
  riskRewardAnalysis: {
    averageRR: number;
    tradesWithRR: number;
    rrDistribution: Array<{
      range: string;
      count: number;
    }>;
  };
  insights: string[];
}

export type PerformanceLabel = 'Excellent' | 'Consistent' | 'Improving' | 'Volatile' | 'Declining';

export interface PerformanceInsight {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
}

export class PerformanceAnalysisService {
  async analyzeUserPerformance(userId: string): Promise<PerformanceMetrics> {
    const trades = await this.fetchUserTrades(userId);
    const strategies = await this.fetchUserStrategies(userId);
    
    if (trades.length === 0) {
      return this.getEmptyMetrics();
    }

    const metrics = this.calculateMetrics(trades, strategies);
    const insights = this.generateInsights(metrics, trades);
    const performanceLabel = this.calculatePerformanceLabel(metrics, trades);

    // Cache the report
    await this.cacheReport(userId, metrics, performanceLabel, trades.length);

    return {
      ...metrics,
      performanceLabel,
      insights: insights.map(i => i.message)
    };
  }

  private async fetchUserTrades(userId: string): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async fetchUserStrategies(userId: string): Promise<Strategy[]> {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  private calculateMetrics(trades: Trade[], strategies: Strategy[]): Omit<PerformanceMetrics, 'performanceLabel' | 'insights'> {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.result === 'WIN').length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    
    const tradesWithRR = trades.filter(t => t.risk_reward_ratio && t.risk_reward_ratio > 0);
    const avgRiskReward = tradesWithRR.length > 0 
      ? tradesWithRR.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / tradesWithRR.length 
      : 0;

    const profitFactor = this.calculateProfitFactor(trades);
    const avgHoldingTime = this.calculateAvgHoldingTime(trades);
    
    return {
      totalTrades,
      winRate,
      totalPnL,
      avgRiskReward,
      profitFactor,
      avgHoldingTime,
      strategyPerformance: this.calculateStrategyPerformance(trades, strategies),
      monthlyPerformance: this.calculateMonthlyPerformance(trades),
      checklistCorrelation: this.calculateChecklistCorrelation(trades),
      riskRewardAnalysis: this.calculateRiskRewardAnalysis(trades)
    };
  }

  private calculateProfitFactor(trades: Trade[]): number {
    const grossProfit = trades
      .filter(t => (t.profit_loss || 0) > 0)
      .reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    
    const grossLoss = Math.abs(trades
      .filter(t => (t.profit_loss || 0) < 0)
      .reduce((sum, t) => sum + (t.profit_loss || 0), 0));

    return grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  }

  private calculateAvgHoldingTime(trades: Trade[]): number {
    const tradesWithDuration = trades.filter(t => t.holding_duration_minutes && t.holding_duration_minutes > 0);
    return tradesWithDuration.length > 0
      ? tradesWithDuration.reduce((sum, t) => sum + (t.holding_duration_minutes || 0), 0) / tradesWithDuration.length
      : 0;
  }

  private calculateStrategyPerformance(trades: Trade[], strategies: Strategy[]) {
    const strategiesMap = new Map(strategies.map(s => [s.id, s.name]));
    const strategyStats = new Map();

    trades.forEach(trade => {
      const strategyId = trade.strategy_used;
      if (!strategyId) return;

      if (!strategyStats.has(strategyId)) {
        strategyStats.set(strategyId, {
          trades: 0,
          wins: 0,
          totalPnL: 0,
          totalRR: 0,
          rrCount: 0
        });
      }

      const stats = strategyStats.get(strategyId);
      stats.trades++;
      if (trade.result === 'WIN') stats.wins++;
      stats.totalPnL += trade.profit_loss || 0;
      if (trade.risk_reward_ratio) {
        stats.totalRR += trade.risk_reward_ratio;
        stats.rrCount++;
      }
    });

    return Array.from(strategyStats.entries()).map(([strategyId, stats]) => ({
      strategyId,
      strategyName: strategiesMap.get(strategyId) || 'Unknown Strategy',
      trades: stats.trades,
      winRate: (stats.wins / stats.trades) * 100,
      totalPnL: stats.totalPnL,
      avgRR: stats.rrCount > 0 ? stats.totalRR / stats.rrCount : 0
    }));
  }

  private calculateMonthlyPerformance(trades: Trade[]) {
    const monthlyStats = new Map();

    trades.forEach(trade => {
      const month = new Date(trade.created_at).toISOString().substring(0, 7);
      
      if (!monthlyStats.has(month)) {
        monthlyStats.set(month, { trades: 0, wins: 0, pnl: 0 });
      }

      const stats = monthlyStats.get(month);
      stats.trades++;
      if (trade.result === 'WIN') stats.wins++;
      stats.pnl += trade.profit_loss || 0;
    });

    return Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({
        month,
        trades: stats.trades,
        winRate: (stats.wins / stats.trades) * 100,
        pnl: stats.pnl
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateChecklistCorrelation(trades: Trade[]) {
    const withChecklist = trades.filter(t => t.checklist_used_id);
    const withoutChecklist = trades.filter(t => !t.checklist_used_id);

    return {
      withChecklist: {
        trades: withChecklist.length,
        winRate: withChecklist.length > 0 
          ? (withChecklist.filter(t => t.result === 'WIN').length / withChecklist.length) * 100 
          : 0
      },
      withoutChecklist: {
        trades: withoutChecklist.length,
        winRate: withoutChecklist.length > 0 
          ? (withoutChecklist.filter(t => t.result === 'WIN').length / withoutChecklist.length) * 100 
          : 0
      }
    };
  }

  private calculateRiskRewardAnalysis(trades: Trade[]) {
    const tradesWithRR = trades.filter(t => t.risk_reward_ratio && t.risk_reward_ratio > 0);
    const avgRR = tradesWithRR.length > 0 
      ? tradesWithRR.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / tradesWithRR.length 
      : 0;

    // Calculate distribution
    const distribution = [
      { range: '< 1:1', count: 0 },
      { range: '1:1 - 2:1', count: 0 },
      { range: '2:1 - 3:1', count: 0 },
      { range: '> 3:1', count: 0 }
    ];

    tradesWithRR.forEach(trade => {
      const rr = trade.risk_reward_ratio || 0;
      if (rr < 1) distribution[0].count++;
      else if (rr < 2) distribution[1].count++;
      else if (rr < 3) distribution[2].count++;
      else distribution[3].count++;
    });

    return {
      averageRR: avgRR,
      tradesWithRR: tradesWithRR.length,
      rrDistribution: distribution
    };
  }

  private generateInsights(metrics: Omit<PerformanceMetrics, 'performanceLabel' | 'insights'>, trades: Trade[]): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Win rate insights
    if (metrics.winRate >= 60) {
      insights.push({ type: 'positive', message: `Excellent win rate of ${metrics.winRate.toFixed(1)}%! You're consistently picking winning trades.` });
    } else if (metrics.winRate >= 50) {
      insights.push({ type: 'neutral', message: `Your win rate of ${metrics.winRate.toFixed(1)}% is solid. Focus on improving your risk-reward ratio.` });
    } else {
      insights.push({ type: 'negative', message: `Your win rate of ${metrics.winRate.toFixed(1)}% needs improvement. Review your entry strategies.` });
    }

    // Strategy performance insights
    if (metrics.strategyPerformance.length > 0) {
      const bestStrategy = metrics.strategyPerformance.reduce((best, current) => 
        current.winRate > best.winRate ? current : best
      );
      insights.push({ 
        type: 'positive', 
        message: `Your best performing strategy is "${bestStrategy.strategyName}" with a ${bestStrategy.winRate.toFixed(1)}% win rate.` 
      });
    }

    // Checklist correlation insights
    const { withChecklist, withoutChecklist } = metrics.checklistCorrelation;
    if (withChecklist.trades > 0 && withoutChecklist.trades > 0) {
      if (withChecklist.winRate > withoutChecklist.winRate + 5) {
        insights.push({ 
          type: 'positive', 
          message: `Using checklists improves your win rate by ${(withChecklist.winRate - withoutChecklist.winRate).toFixed(1)}%. Keep it up!` 
        });
      } else if (withoutChecklist.winRate > withChecklist.winRate + 5) {
        insights.push({ 
          type: 'negative', 
          message: `Your performance is better without checklists. Consider revising your checklist items.` 
        });
      }
    }

    // Profit factor insights
    if (metrics.profitFactor >= 2) {
      insights.push({ type: 'positive', message: `Excellent profit factor of ${metrics.profitFactor.toFixed(2)}. Your winners significantly outweigh your losers.` });
    } else if (metrics.profitFactor >= 1.5) {
      insights.push({ type: 'neutral', message: `Good profit factor of ${metrics.profitFactor.toFixed(2)}. You're managing risk well.` });
    } else if (metrics.profitFactor < 1) {
      insights.push({ type: 'negative', message: `Your profit factor of ${metrics.profitFactor.toFixed(2)} indicates losses exceed profits. Review your risk management.` });
    }

    return insights;
  }

  private calculatePerformanceLabel(metrics: Omit<PerformanceMetrics, 'performanceLabel' | 'insights'>, trades: Trade[]): PerformanceLabel {
    const score = this.calculatePerformanceScore(metrics, trades);
    
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Consistent';
    if (score >= 50) return 'Improving';
    if (score >= 35) return 'Volatile';
    return 'Declining';
  }

  private calculatePerformanceScore(metrics: Omit<PerformanceMetrics, 'performanceLabel' | 'insights'>, trades: Trade[]): number {
    let score = 0;

    // Win rate (0-30 points)
    score += Math.min(metrics.winRate * 0.5, 30);

    // Profit factor (0-25 points)
    if (metrics.profitFactor >= 2) score += 25;
    else if (metrics.profitFactor >= 1.5) score += 20;
    else if (metrics.profitFactor >= 1) score += 10;

    // Risk-reward ratio (0-20 points)
    if (metrics.avgRiskReward >= 2) score += 20;
    else if (metrics.avgRiskReward >= 1.5) score += 15;
    else if (metrics.avgRiskReward >= 1) score += 10;

    // Consistency (0-15 points) - based on monthly performance variance
    const monthlyVariance = this.calculateMonthlyVariance(metrics.monthlyPerformance);
    if (monthlyVariance < 10) score += 15;
    else if (monthlyVariance < 20) score += 10;
    else if (monthlyVariance < 30) score += 5;

    // Trade volume (0-10 points)
    if (trades.length >= 50) score += 10;
    else if (trades.length >= 20) score += 7;
    else if (trades.length >= 10) score += 5;

    return Math.min(score, 100);
  }

  private calculateMonthlyVariance(monthlyPerformance: Array<{ winRate: number }>): number {
    if (monthlyPerformance.length < 2) return 0;
    
    const winRates = monthlyPerformance.map(m => m.winRate);
    const mean = winRates.reduce((sum, rate) => sum + rate, 0) / winRates.length;
    const variance = winRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / winRates.length;
    
    return Math.sqrt(variance);
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      avgRiskReward: 0,
      profitFactor: 0,
      avgHoldingTime: 0,
      performanceLabel: 'Improving',
      strategyPerformance: [],
      monthlyPerformance: [],
      checklistCorrelation: {
        withChecklist: { trades: 0, winRate: 0 },
        withoutChecklist: { trades: 0, winRate: 0 }
      },
      riskRewardAnalysis: {
        averageRR: 0,
        tradesWithRR: 0,
        rrDistribution: []
      },
      insights: ['Start trading to see your performance analysis.']
    };
  }

  private async cacheReport(userId: string, metrics: Omit<PerformanceMetrics, 'performanceLabel' | 'insights'>, performanceLabel: PerformanceLabel, tradesAnalyzed: number) {
    try {
      const reportData = JSON.stringify(metrics);
      
      const { error } = await supabase
        .from('user_performance_reports')
        .upsert({
          user_id: userId,
          report_data: reportData as any,
          performance_label: performanceLabel,
          trades_analyzed: tradesAnalyzed
        });

      if (error) console.error('Failed to cache performance report:', error);
    } catch (error) {
      console.error('Error caching report:', error);
    }
  }
}

export const performanceAnalysisService = new PerformanceAnalysisService();
