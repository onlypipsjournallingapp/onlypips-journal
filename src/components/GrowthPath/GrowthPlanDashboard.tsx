import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TradeEntryForm from './TradeEntryForm';
import GrowthChart from './GrowthChart';

interface GrowthPlan {
  id: string;
  starting_balance: number;
  target_balance: number;
  current_balance: number;
  risk_level: string;
  risk_percentage: number;
  estimated_trades: number;
  profit_per_trade: number;
  risk_per_trade: number;
  trades_completed: number;
  is_active: boolean;
  created_at: string;
}

interface GrowthTrade {
  id: string;
  trade_date: string;
  actual_profit_loss: number;
  hit_target: boolean;
  notes: string | null;
}

interface GrowthPlanDashboardProps {
  plan: GrowthPlan;
  onPlanUpdated: () => void;
  onPlanReset: () => void;
}

const GrowthPlanDashboard: React.FC<GrowthPlanDashboardProps> = ({ 
  plan, 
  onPlanUpdated,
  onPlanReset 
}) => {
  const [trades, setTrades] = useState<GrowthTrade[]>([]);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrades();
  }, [plan.id]);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_plan_trades')
        .select('*')
        .eq('growth_plan_id', plan.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const handleTradeAdded = () => {
    fetchTrades();
    onPlanUpdated();
    setShowTradeForm(false);
    toast({
      title: "Trade Recorded",
      description: "Your trade has been added to the growth plan",
    });
  };

  const balanceProgress = ((plan.current_balance - plan.starting_balance) / (plan.target_balance - plan.starting_balance)) * 100;
  const tradesProgress = (plan.trades_completed / plan.estimated_trades) * 100;
  
  const remainingAmount = plan.target_balance - plan.current_balance;
  const remainingTrades = Math.max(0, plan.estimated_trades - plan.trades_completed);
  
  // Recalculate based on current balance
  const updatedRiskPerTrade = plan.current_balance * (plan.risk_percentage / 100);
  const updatedProfitPerTrade = remainingTrades > 0 ? remainingAmount / remainingTrades : 0;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Growth Plan</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRiskLevelColor(plan.risk_level)}>
                {plan.risk_level} Risk ({plan.risk_percentage}%)
              </Badge>
              <span className="text-sm text-muted-foreground">
                Started {new Date(plan.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={onPlanReset}>
            Reset Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">${plan.current_balance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">${plan.target_balance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Target Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{plan.trades_completed}</p>
              <p className="text-sm text-muted-foreground">Trades Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{remainingTrades}</p>
              <p className="text-sm text-muted-foreground">Trades Remaining</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Balance Progress</span>
                <span>{balanceProgress.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(balanceProgress, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Trades Progress</span>
                <span>{tradesProgress.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(tradesProgress, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updated Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Updated Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">${updatedProfitPerTrade.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Profit Per Trade Needed</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">${updatedRiskPerTrade.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Risk Per Trade</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">${remainingAmount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Remaining to Goal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <GrowthChart plan={plan} trades={trades} />

      {/* Trade Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Record Today's Trade</CardTitle>
        </CardHeader>
        <CardContent>
          {!showTradeForm ? (
            <Button onClick={() => setShowTradeForm(true)} className="w-full">
              Add Trade Result
            </Button>
          ) : (
            <TradeEntryForm
              planId={plan.id}
              targetProfit={updatedProfitPerTrade}
              onTradeAdded={handleTradeAdded}
              onCancel={() => setShowTradeForm(false)}
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Trades */}
      {trades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trades.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {new Date(trade.trade_date).toLocaleDateString()}
                    </p>
                    {trade.notes && (
                      <p className="text-sm text-muted-foreground">{trade.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trade.actual_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.actual_profit_loss >= 0 ? '+' : ''}${trade.actual_profit_loss.toFixed(2)}
                    </p>
                    <Badge variant={trade.hit_target ? 'default' : 'secondary'}>
                      {trade.hit_target ? 'Target Hit' : 'Target Missed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GrowthPlanDashboard;
