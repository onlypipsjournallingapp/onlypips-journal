
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface AdvancedChartsProps {
  trades: Trade[];
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ trades }) => {
  // Cumulative P&L data
  const cumulativePnL = trades
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, trade, index) => {
      const prevValue = index > 0 ? acc[index - 1].cumulative : 0;
      acc.push({
        trade: index + 1,
        pnl: Number(trade.profit_loss),
        cumulative: prevValue + Number(trade.profit_loss),
        date: new Date(trade.created_at).toLocaleDateString()
      });
      return acc;
    }, [] as any[]);

  // Monthly performance
  const monthlyData = trades.reduce((acc, trade) => {
    const month = new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { month, wins: 0, losses: 0, pnl: 0, trades: 0 };
    }
    acc[month].pnl += Number(trade.profit_loss);
    acc[month].trades += 1;
    if (trade.result === 'WIN') acc[month].wins += 1;
    if (trade.result === 'LOSS') acc[month].losses += 1;
    return acc;
  }, {} as any);

  const monthlyPerformance = Object.values(monthlyData);

  // Fixed pair performance - ensure we have data and handle edge cases
  const pairData = trades.reduce((acc, trade) => {
    // Make sure we have a valid pair
    if (!trade.pair) return acc;
    
    if (!acc[trade.pair]) {
      acc[trade.pair] = { pair: trade.pair, trades: 0, pnl: 0, wins: 0 };
    }
    acc[trade.pair].trades += 1;
    acc[trade.pair].pnl += Number(trade.profit_loss || 0);
    if (trade.result === 'WIN') acc[trade.pair].wins += 1;
    return acc;
  }, {} as any);

  const pairPerformance = Object.values(pairData)
    .filter((pair: any) => pair.trades > 0) // Only include pairs with trades
    .sort((a: any, b: any) => b.pnl - a.pnl)
    .slice(0, 8);

  // Debug logging for pair performance
  console.log('Pair Performance Debug:', {
    tradesCount: trades.length,
    pairDataKeys: Object.keys(pairData),
    pairPerformance: pairPerformance,
    sampleTrade: trades[0]
  });

  // Risk distribution
  const riskData = [
    { name: 'High Risk', value: trades.filter(t => Math.abs(Number(t.profit_loss)) > 50).length, color: '#ef4444' },
    { name: 'Medium Risk', value: trades.filter(t => Math.abs(Number(t.profit_loss)) >= 20 && Math.abs(Number(t.profit_loss)) <= 50).length, color: '#f59e0b' },
    { name: 'Low Risk', value: trades.filter(t => Math.abs(Number(t.profit_loss)) < 20).length, color: '#10b981' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cumulative P&L Chart */}
      <Card className="lg:col-span-2 glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Cumulative Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cumulativePnL.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativePnL}>
                  <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="trade" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    fill="url(#pnlGradient)"
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No trade data available for cumulative performance chart
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyPerformance.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                  <Bar dataKey="pnl" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No monthly data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskData.some(item => item.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {riskData.filter(item => item.value > 0).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No risk data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Pairs */}
      <Card className="lg:col-span-2 glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Currency Pair Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pairPerformance.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pairPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis dataKey="pair" type="category" stroke="#9CA3AF" fontSize={12} width={60} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'pnl') return [`$${Number(value).toFixed(2)}`, 'P&L'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Pair: ${label}`}
                  />
                  <Bar dataKey="pnl" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg mb-2">No currency pair data available</p>
                <p className="text-sm">Trade data needs to include currency pair information</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCharts;
