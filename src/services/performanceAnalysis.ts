import { supabase } from "@/integrations/supabase/client";

export type PerformanceLabel = 'Weekly' | 'Monthly' | 'All Time';

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  totalProfit: number;
  totalLoss: number;
}

const calculatePerformanceMetrics = (trades: any[], label: PerformanceLabel): PerformanceMetrics => {
  const now = new Date();
  let filteredTrades = trades;

  if (label === 'Weekly') {
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    filteredTrades = trades.filter(trade => new Date(trade.created_at) >= startOfWeek);
  } else if (label === 'Monthly') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredTrades = trades.filter(trade => new Date(trade.created_at) >= startOfMonth);
  }

  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(trade => trade.profit_loss > 0).length;
  const losingTrades = filteredTrades.filter(trade => trade.profit_loss < 0).length;

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalProfit = filteredTrades.reduce((sum, trade) => (trade.profit_loss > 0 ? sum + trade.profit_loss : sum), 0);
  const totalLoss = Math.abs(filteredTrades.reduce((sum, trade) => (trade.profit_loss < 0 ? sum + trade.profit_loss : sum), 0));

  const averageProfit = winningTrades > 0 ? totalProfit / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;

  let profitFactor = 0;
  if (totalLoss !== 0) {
    profitFactor = totalProfit / totalLoss;
  }

  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentConsecutiveWins = 0;
  let currentConsecutiveLosses = 0;

  for (const trade of filteredTrades) {
    if (trade.profit_loss > 0) {
      currentConsecutiveWins++;
      currentConsecutiveLosses = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
    } else {
      currentConsecutiveLosses++;
      currentConsecutiveWins = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
    }
  }

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    averageProfit,
    averageLoss,
    profitFactor,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    totalProfit,
    totalLoss,
  };
};

const generateReportText = (metrics: PerformanceMetrics, tradesAnalyzed: number, label: PerformanceLabel): string => {
  return `
    ${label} Performance Report:

    Trades Analyzed: ${tradesAnalyzed}
    Total Trades: ${metrics.totalTrades}
    Winning Trades: ${metrics.winningTrades}
    Losing Trades: ${metrics.losingTrades}
    Win Rate: ${metrics.winRate.toFixed(2)}%
    Average Profit: $${metrics.averageProfit.toFixed(2)}
    Average Loss: $${metrics.averageLoss.toFixed(2)}
    Profit Factor: ${metrics.profitFactor.toFixed(2)}
    Max Consecutive Wins: ${metrics.maxConsecutiveWins}
    Max Consecutive Losses: ${metrics.maxConsecutiveLosses}
    Total Profit: $${metrics.totalProfit.toFixed(2)}
    Total Loss: $${metrics.totalLoss.toFixed(2)}
  `;
};

export const generatePerformanceReport = async (userId: string, label: PerformanceLabel): Promise<string> => {
  console.log(`Generating ${label} performance report for user ${userId}`);
  
  try {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }

    if (!trades || trades.length === 0) {
      throw new Error('No trades found to analyze');
    }

    console.log(`Found ${trades.length} trades for analysis`);
    
    const metrics = calculatePerformanceMetrics(trades, label);
    console.log('Calculated metrics:', metrics);

    // Convert PerformanceMetrics to Json compatible format
    const reportData = JSON.parse(JSON.stringify(metrics));

    // Save the report to the database
    const { data: reportRecord, error: saveError } = await supabase
      .from('user_performance_reports')
      .insert({
        user_id: userId,
        report_data: reportData,
        performance_label: label,
        trades_analyzed: trades.length
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
      // Don't throw here, just log the error and continue
    } else {
      console.log('Report saved successfully:', reportRecord);
    }

    // Generate the report text
    return generateReportText(metrics, trades.length, label);
  } catch (error) {
    console.error('Error in generatePerformanceReport:', error);
    throw error;
  }
};
