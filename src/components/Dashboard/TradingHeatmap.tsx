
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradingHeatmapProps {
  trades: Trade[];
}

const TradingHeatmap: React.FC<TradingHeatmapProps> = ({ trades }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create heatmap data
  const heatmapData = days.map(day => 
    hours.map(hour => {
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.created_at);
        const tradeDayName = tradeDate.toLocaleDateString('en-US', { weekday: 'short' });
        const tradeHour = tradeDate.getHours();
        return tradeDayName === day && tradeHour === hour;
      });
      
      const totalPnL = dayTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0);
      const tradeCount = dayTrades.length;
      
      return {
        day,
        hour,
        trades: tradeCount,
        pnl: totalPnL,
        intensity: tradeCount > 0 ? Math.min(tradeCount / 5, 1) : 0
      };
    })
  );

  const getHeatmapColor = (intensity: number, pnl: number) => {
    if (intensity === 0) return 'bg-gray-800/20';
    
    const alpha = 0.3 + (intensity * 0.7);
    if (pnl > 0) {
      return `bg-green-500 opacity-${Math.round(alpha * 100)}`;
    } else if (pnl < 0) {
      return `bg-red-500 opacity-${Math.round(alpha * 100)}`;
    }
    return `bg-blue-500 opacity-${Math.round(alpha * 100)}`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Trading Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Hour labels */}
          <div className="grid grid-cols-25 gap-1 mb-2">
            <div className="text-xs text-muted-foreground"></div>
            {hours.map(hour => (
              <div key={hour} className="text-xs text-muted-foreground text-center w-4">
                {hour % 4 === 0 ? hour : ''}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {heatmapData.map((dayData, dayIndex) => (
            <div key={days[dayIndex]} className="grid grid-cols-25 gap-1">
              <div className="text-xs text-muted-foreground text-right pr-2 flex items-center">
                {days[dayIndex]}
              </div>
              {dayData.map((cellData, hourIndex) => (
                <div
                  key={`${dayIndex}-${hourIndex}`}
                  className={`w-4 h-4 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${
                    cellData.intensity === 0 
                      ? 'bg-gray-800/20' 
                      : cellData.pnl > 0 
                        ? `bg-green-500` 
                        : cellData.pnl < 0 
                          ? `bg-red-500` 
                          : `bg-blue-500`
                  }`}
                  style={{
                    opacity: cellData.intensity === 0 ? 0.1 : 0.3 + (cellData.intensity * 0.7)
                  }}
                  title={`${days[dayIndex]} ${cellData.hour}:00 - ${cellData.trades} trades, P&L: ${cellData.pnl.toFixed(2)}`}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Less activity</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-800/20 rounded-sm"></div>
            <div className="w-3 h-3 bg-red-500 opacity-30 rounded-sm"></div>
            <div className="w-3 h-3 bg-red-500 opacity-60 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 opacity-60 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 opacity-100 rounded-sm"></div>
          </div>
          <span>More activity</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingHeatmap;
