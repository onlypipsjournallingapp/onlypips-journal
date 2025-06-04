
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  actualProfitLoss: z.number(),
  hitTarget: z.boolean(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TradeEntryFormProps {
  planId: string;
  targetProfit: number;
  onTradeAdded: () => void;
  onCancel: () => void;
}

const TradeEntryForm: React.FC<TradeEntryFormProps> = ({ 
  planId, 
  targetProfit, 
  onTradeAdded, 
  onCancel 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hitTarget: false,
      notes: ''
    }
  });

  const hitTarget = watch('hitTarget');

  // Auto-fill profit when target is hit
  React.useEffect(() => {
    if (hitTarget) {
      setValue('actualProfitLoss', targetProfit);
    }
  }, [hitTarget, targetProfit, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Add the trade record
      const { error: tradeError } = await supabase
        .from('growth_plan_trades')
        .insert({
          growth_plan_id: planId,
          actual_profit_loss: data.actualProfitLoss,
          hit_target: data.hitTarget,
          notes: data.notes || null
        });

      if (tradeError) throw tradeError;

      // Update the growth plan
      const { data: planData, error: planFetchError } = await supabase
        .from('growth_plans')
        .select('current_balance, trades_completed')
        .eq('id', planId)
        .single();

      if (planFetchError) throw planFetchError;

      const newBalance = planData.current_balance + data.actualProfitLoss;
      const newTradesCompleted = planData.trades_completed + 1;

      const { error: updateError } = await supabase
        .from('growth_plans')
        .update({
          current_balance: newBalance,
          trades_completed: newTradesCompleted
        })
        .eq('id', planId);

      if (updateError) throw updateError;

      onTradeAdded();
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: "Error",
        description: "Failed to record trade",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hitTarget"
          checked={hitTarget}
          onCheckedChange={(checked) => setValue('hitTarget', !!checked)}
        />
        <Label htmlFor="hitTarget">
          Hit target profit of ${targetProfit.toFixed(2)}
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="actualProfitLoss">Actual Profit/Loss ($)</Label>
        <Input
          id="actualProfitLoss"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('actualProfitLoss', { valueAsNumber: true })}
        />
        {errors.actualProfitLoss && (
          <p className="text-sm text-destructive">{errors.actualProfitLoss.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this trade..."
          {...register('notes')}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Recording...' : 'Record Trade'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TradeEntryForm;
