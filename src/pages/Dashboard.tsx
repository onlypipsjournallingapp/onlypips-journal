
import React, { useEffect, useState } from 'react';
import TradeStats from '@/components/Dashboard/TradeStats';
import MetricsGrid from '@/components/Dashboard/MetricsGrid';
import AdvancedCharts from '@/components/Dashboard/AdvancedCharts';
import TradingHeatmap from '@/components/Dashboard/TradingHeatmap';
import PerformanceMetrics from '@/components/Dashboard/PerformanceMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, MinusCircle, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useParams, useNavigate } from "react-router-dom";

interface DashboardProps {
  userId: string;
  accountType?: "real" | "demo";
  accountName?: string;
}

type Account = Database['public']['Tables']['accounts']['Row'];
type Trade = Database['public']['Tables']['trades']['Row'];

const Dashboard: React.FC<DashboardProps> = ({ userId, accountType, accountName }) => {
  const params = useParams();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigate = useNavigate();

  const effectiveType = accountType || params.accountType;
  const effectiveName = accountName || params.accountName;

  const fetchAccountAndTrades = async () => {
    if (!effectiveType || !effectiveName) {
      navigate("/accounts");
      return;
    }

    setIsLoading(true);
    const safeAccountName = decodeURIComponent(effectiveName);
    
    // Fetch account by name+type+user
    const { data: acc, error: accErr } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("type", effectiveType.toUpperCase())
      .eq("name", safeAccountName)
      .maybeSingle();

    if (accErr || !acc) {
      console.error("Account fetch error:", accErr);
      setAccount(null);
      setTrades([]);
      setIsLoading(false);
      return;
    }

    setAccount(acc);

    // Fetch trades for this account with real-time updates
    const { data: trs, error: trErr } = await supabase
      .from("trades")
      .select("*")
      .eq("account_id", acc.id)
      .order("created_at", { ascending: false });

    if (trErr) {
      console.error("Trades fetch error:", trErr);
    } else {
      setTrades(trs || []);
      setLastUpdated(new Date());
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAccountAndTrades();
  }, [userId, effectiveType, effectiveName]);

  // Set up real-time subscription for trades
  useEffect(() => {
    if (!account) return;

    const channel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `account_id=eq.${account.id}`
        },
        (payload) => {
          console.log('Real-time trade update:', payload);
          // Refresh trades data when changes occur
          fetchAccountAndTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [account?.id]);

  if (!effectiveType || !effectiveName) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  {account ? account.name : "Trading Dashboard"}
                </h1>
                <p className="text-muted-foreground">
                  {account
                    ? `${account.type} Account - Live Analytics Dashboard`
                    : "Account not found."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-2xl font-bold">{trades.length}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500">Live Data</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-primary text-sm">Loading</div>
            </div>
          </div>
        ) : (
          account && (
            <div className="space-y-8">
              {/* Advanced Metrics Grid - Connected to live trade data */}
              <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Performance Overview
                </h2>
                <MetricsGrid trades={trades} />
              </div>

              {/* Standard Stats - Connected to live trade data */}
              <div className="animate-fade-in" style={{animationDelay: '300ms'}}>
                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Trade Summary
                </h2>
                <TradeStats trades={trades} />
              </div>

              {/* Advanced Charts - Connected to live trade data */}
              {trades.length >= 5 && (
                <div className="animate-fade-in" style={{animationDelay: '500ms'}}>
                  <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Performance Analytics
                  </h2>
                  <AdvancedCharts trades={trades} />
                </div>
              )}

              {/* Performance Metrics - Connected to live trade data */}
              {trades.length >= 10 && (
                <div className="animate-fade-in" style={{animationDelay: '700ms'}}>
                  <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Advanced Risk Metrics
                  </h2>
                  <PerformanceMetrics trades={trades} />
                </div>
              )}

              {/* Trading Heatmap - Connected to live trade data */}
              {trades.length >= 15 && (
                <div className="animate-fade-in" style={{animationDelay: '900ms'}}>
                  <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Trading Patterns
                  </h2>
                  <TradingHeatmap trades={trades} />
                </div>
              )}

              {/* Recent Trades - Connected to live trade data */}
              {trades.length > 0 && (
                <div className="mt-8 animate-fade-in" style={{animationDelay: '800ms'}}>
                  <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Recent Trades
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {trades.slice(0, 3).map((trade) => (
                      <Card 
                        key={trade.id} 
                        className="glass-card card-animate border border-white/10 hover:border-white/20"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-base bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{trade.pair}</CardTitle>
                            <div className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              trade.result === 'WIN' ? 'bg-profit/10 text-profit' : 
                              trade.result === 'LOSS' ? 'bg-loss/10 text-loss' : 
                              'bg-neutral/10 text-neutral'
                            }`}>
                              {trade.result}
                            </div>
                          </div>
                          <CardDescription className="flex items-center text-xs">
                            {trade.result === 'BREAK EVEN' || trade.is_break_even ? (
                              <MinusCircle className="h-3 w-3 mr-1 text-neutral" />
                            ) : trade.direction === 'BUY' ? (
                              <ArrowUpCircle className="h-3 w-3 mr-1 text-profit" />
                            ) : (
                              <ArrowUpCircle className="h-3 w-3 mr-1 text-loss transform rotate-180" />
                            )}
                            {trade.direction}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <div className="grid grid-cols-2 gap-1 mb-2">
                            {trade.entry_price !== null && trade.entry_price !== undefined && (
                              <>
                                <div className="text-muted-foreground">Entry</div>
                                <div className="text-right">{trade.entry_price}</div>
                              </>
                            )}
                            {trade.exit_price !== null && trade.exit_price !== undefined && (
                              <>
                                <div className="text-muted-foreground">Exit</div>
                                <div className="text-right">{trade.exit_price}</div>
                              </>
                            )}
                            {trade.result !== 'BREAK EVEN' && !trade.is_break_even && (
                              <>
                                <div className="text-muted-foreground">P/L</div>
                                <div className={`text-right ${Number(trade.profit_loss) > 0 ? 'text-profit' : 'text-loss'}`}>
                                  {Number(trade.profit_loss) > 0 ? '+' : ''}{trade.profit_loss}
                                </div>
                              </>
                            )}
                          </div>
                          {trade.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-2 italic">
                              "{trade.notes}"
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(trade.created_at).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Source Indicator */}
              <div className="mt-8 p-4 bg-card/50 rounded-lg border border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground">All data is live from backend database</span>
                  </div>
                  <span className="text-muted-foreground">
                    Account: {account.name} ({account.type})
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
