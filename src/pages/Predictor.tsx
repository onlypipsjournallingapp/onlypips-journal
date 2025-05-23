
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PredictionCard from '@/components/Predictor/PredictionCard';

type EconomicEvent = Database['public']['Tables']['economic_events']['Row'];
type Prediction = Database['public']['Tables']['predictions']['Row'];

interface PredictorProps {
  userId: string;
}

interface EventWithCounts extends EconomicEvent {
  usd_strong_count: number;
  usd_weak_count: number;
  user_prediction?: 'USD_STRONG' | 'USD_WEAK';
}

const Predictor: React.FC<PredictorProps> = ({ userId }) => {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  useEffect(() => {
    fetchEventsAndPredictions();
  }, [userId]);

  const fetchEventsAndPredictions = async () => {
    try {
      setLoading(true);

      // Fetch active events
      const { data: eventsData, error: eventsError } = await supabase
        .from('economic_events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch user's predictions for current month
      const { data: userPredictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth);

      if (predictionsError) throw predictionsError;

      // Get prediction counts for each event
      const eventsWithCounts = await Promise.all(
        eventsData.map(async (event) => {
          const { data: counts } = await supabase.rpc('get_event_prediction_counts', {
            event_uuid: event.id,
            target_month: currentMonth
          });

          const userPrediction = userPredictions?.find(p => p.event_id === event.id);

          return {
            ...event,
            usd_strong_count: counts?.[0]?.usd_strong_count || 0,
            usd_weak_count: counts?.[0]?.usd_weak_count || 0,
            user_prediction: userPrediction?.prediction_side as 'USD_STRONG' | 'USD_WEAK' | undefined
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrediction = async (eventId: string, predictionSide: 'USD_STRONG' | 'USD_WEAK') => {
    try {
      const { error } = await supabase
        .from('predictions')
        .insert({
          user_id: userId,
          event_id: eventId,
          prediction_side: predictionSide,
          month_year: currentMonth
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Prediction exists",
            description: "You've already made a prediction for this event this month.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Prediction submitted!",
        description: "Your market prediction has been recorded.",
      });

      // Refresh the data
      fetchEventsAndPredictions();
    } catch (error) {
      console.error('Error submitting prediction:', error);
      toast({
        title: "Error",
        description: "Failed to submit prediction. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Market Predictor</h1>
        </div>
        <p className="text-muted-foreground">
          Predict market direction for major economic events. Choose your side wisely!
        </p>
      </div>

      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Your predictions are recorded monthly. Each month starts fresh with reset counters.
          Current month: <strong>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active events available for predictions.</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <PredictionCard
              key={event.id}
              event={event}
              onPredict={handlePrediction}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Predictor;
