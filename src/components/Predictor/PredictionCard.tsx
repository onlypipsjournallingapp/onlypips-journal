
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, CheckCircle, Calendar } from 'lucide-react';

interface EventWithCounts {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  usd_strong_count: number;
  usd_weak_count: number;
  user_prediction?: 'USD_STRONG' | 'USD_WEAK';
}

interface PredictionCardProps {
  event: EventWithCounts;
  onPredict: (eventId: string, predictionSide: 'USD_STRONG' | 'USD_WEAK') => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ event, onPredict }) => {
  const totalPredictions = event.usd_strong_count + event.usd_weak_count;
  const usdStrongPercentage = totalPredictions > 0 ? (event.usd_strong_count / totalPredictions) * 100 : 50;
  const usdWeakPercentage = totalPredictions > 0 ? (event.usd_weak_count / totalPredictions) * 100 : 50;

  const hasUserPrediction = !!event.user_prediction;

  // Format the event date
  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  const formattedDate = formatEventDate(event.event_date);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{event.name}</CardTitle>
            {formattedDate && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            )}
            {event.description && (
              <CardDescription className="mt-2">{event.description}</CardDescription>
            )}
          </div>
          {hasUserPrediction && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Predicted
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Prediction Interface */}
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Predict which side will benefit from this event
          </div>
          
          {/* Two-sided prediction bars */}
          <div className="relative">
            {/* Background bars */}
            <div className="flex h-16 rounded-lg overflow-hidden border">
              {/* USD Strong side (left) */}
              <Button
                variant={event.user_prediction === 'USD_STRONG' ? 'default' : 'outline'}
                className="flex-1 h-full rounded-none rounded-l-lg border-r-0 flex-col justify-center relative overflow-hidden"
                onClick={() => !hasUserPrediction && onPredict(event.id, 'USD_STRONG')}
                disabled={hasUserPrediction}
              >
                <div className="flex items-center gap-2 relative z-10">
                  <TrendingUp className="h-4 w-4" />
                  <div className="text-xs font-medium">USD Strong</div>
                </div>
                <div className="text-xs text-muted-foreground relative z-10">
                  USD-XXX pairs up
                </div>
                
                {/* Progress fill */}
                {totalPredictions > 0 && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-green-500/20 transition-all duration-500"
                    style={{ width: `${usdStrongPercentage}%` }}
                  />
                )}
              </Button>

              {/* USD Weak side (right) */}
              <Button
                variant={event.user_prediction === 'USD_WEAK' ? 'default' : 'outline'}
                className="flex-1 h-full rounded-none rounded-r-lg border-l-0 flex-col justify-center relative overflow-hidden"
                onClick={() => !hasUserPrediction && onPredict(event.id, 'USD_WEAK')}
                disabled={hasUserPrediction}
              >
                <div className="flex items-center gap-2 relative z-10">
                  <TrendingDown className="h-4 w-4" />
                  <div className="text-xs font-medium">USD Weak</div>
                </div>
                <div className="text-xs text-muted-foreground relative z-10">
                  XXX-USD pairs up
                </div>
                
                {/* Progress fill */}
                {totalPredictions > 0 && (
                  <div 
                    className="absolute right-0 top-0 h-full bg-red-500/20 transition-all duration-500"
                    style={{ width: `${usdWeakPercentage}%` }}
                  />
                )}
              </Button>
            </div>
          </div>

          {/* Prediction counts */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>USD Strong: {event.usd_strong_count}</span>
            </div>
            <div className="text-muted-foreground">
              Total: {totalPredictions}
            </div>
            <div className="flex items-center gap-2">
              <span>USD Weak: {event.usd_weak_count}</span>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>

          {/* User's prediction status */}
          {hasUserPrediction && (
            <div className="text-center text-sm">
              <Badge variant={event.user_prediction === 'USD_STRONG' ? 'default' : 'secondary'}>
                Your prediction: {event.user_prediction === 'USD_STRONG' ? 'USD Strong' : 'USD Weak'}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
