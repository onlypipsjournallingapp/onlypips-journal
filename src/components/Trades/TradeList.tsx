
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp, Image, MinusCircle } from "lucide-react";
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradeListProps {
  trades: Trade[];
}

const TradeCard: React.FC<{ trade: Trade }> = ({ trade }) => {
  const [expanded, setExpanded] = useState(false);

  const resultColor = 
    trade.result === 'WIN' ? 'bg-profit/10 text-profit' : 
    trade.result === 'LOSS' ? 'bg-loss/10 text-loss' : 
    'bg-neutral/10 text-neutral';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card className={`glass-card card-animate mb-4 overflow-hidden transition-all ${expanded ? 'pb-3' : ''}`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {trade.result === 'BREAK EVEN' || trade.is_break_even ? (
            <MinusCircle className="h-5 w-5 text-neutral" />
          ) : trade.direction === 'BUY' ? (
            <ArrowUpCircle className="h-5 w-5 text-profit" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-loss" />
          )}
          <div className="flex flex-col">
            <span className="font-medium">{trade.pair}</span>
            <Badge variant="outline" className="w-fit text-xs">
              {trade.trade_type}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={resultColor}>
            {trade.result}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>
      
      {expanded && (
        <CardContent className="pt-0 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {trade.entry_price !== null && trade.entry_price !== undefined && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Entry:</span> {trade.entry_price}
                </div>
              )}
              {trade.exit_price !== null && trade.exit_price !== undefined && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Exit:</span> {trade.exit_price}
                </div>
              )}
              {trade.result !== 'BREAK EVEN' && !trade.is_break_even && (
                <div className="text-sm">
                  <span className="text-muted-foreground">P/L:</span> {Number(trade.profit_loss) > 0 ? '+' : ''}{trade.profit_loss}
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">Date:</span> {formatDate(trade.created_at)}
              </div>
              {trade.notes && (
                <div className="pt-2">
                  <span className="text-sm text-muted-foreground">Notes:</span>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{trade.notes}</p>
                </div>
              )}
            </div>
            
            {trade.screenshot_url && (
              <div className="flex justify-center items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative w-full h-24 cursor-pointer overflow-hidden rounded-md border hover:opacity-80 transition-opacity">
                      <img 
                        src={trade.screenshot_url} 
                        alt={`Chart of ${trade.pair}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Image className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {trade.pair} Chart - {formatDate(trade.created_at)}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-hidden rounded-md">
                      <img 
                        src={trade.screenshot_url} 
                        alt={`Chart of ${trade.pair}`}
                        className="w-full h-auto"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  if (!trades.length) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fade-in">
        No trades recorded yet. Add your first trade to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {trades.map((trade) => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  );
};

export default TradeList;
