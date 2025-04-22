
import React, { useEffect, useState } from 'react';
import TradeStats from '@/components/Dashboard/TradeStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, MinusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useParams, useNavigate } from "react-router-dom";

interface DashboardProps {
  userId: string;
  // For legacy route, we can fallback to default
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
  const navigate = useNavigate();

  // Backward compatibility for legacy route
  const effectiveType = accountType || params.accountType;
  const effectiveName = accountName || params.accountName;

  useEffect(() => {
    // If no accountType/name provided, redirect to Accounts summary
    if (!effectiveType || !effectiveName) {
      navigate("/accounts");
      return;
    }
    // decode account name for URL
    const safeAccountName = decodeURIComponent(effectiveName);
    const fetchAccountAndTrades = async () => {
      setIsLoading(true);
      // 1. Fetch account by name+type+user
      const { data: acc, error: accErr } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .eq("type", effectiveType.toUpperCase())
        .eq("name", safeAccountName)
        .maybeSingle();
      if (accErr || !acc) {
        setAccount(null);
        setTrades([]);
        setIsLoading(false);
        return;
      }
      setAccount(acc);

      // 2. Fetch trades for this account
      const { data: trs, error: trErr } = await supabase
        .from("trades")
        .select("*")
        .eq("account_id", acc.id)
        .order("created_at", { ascending: false });
      setTrades(trs || []);
      setIsLoading(false);
      if (trErr) console.error(trErr);
    };

    fetchAccountAndTrades();
  }, [userId, effectiveType, effectiveName]);

  if (!effectiveType || !effectiveName) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {account ? account.name : "Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {account
              ? `(${account.type}) - View trades and stats for this account.`
              : "Account not found."}
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      ) : (
        account && (
          <>
            <TradeStats trades={trades} />
            {trades.length > 0 && (
              <div className="mt-8 animate-fade-in" style={{animationDelay: '800ms'}}>
                <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trades.slice(0, 3).map((trade) => (
                    <Card key={trade.id} className="glass-card card-animate">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{trade.pair}</CardTitle>
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
                              <div className="text-right">
                                {Number(trade.profit_loss) > 0 ? '+' : ''}{trade.profit_loss}
                              </div>
                            </>
                          )}
                        </div>
                        {trade.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                            {trade.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

export default Dashboard;
