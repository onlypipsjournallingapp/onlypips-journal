
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  startingBalance: z.number().min(1, 'Starting balance must be greater than 0'),
  targetBalance: z.number().min(1, 'Target balance must be greater than 0'),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Custom']),
  customRiskPercentage: z.number().min(0.1, 'Risk percentage must be at least 0.1%').max(50, 'Risk percentage cannot exceed 50%').optional(),
}).refine((data) => data.targetBalance > data.startingBalance, {
  message: "Target balance must be greater than starting balance",
  path: ["targetBalance"],
}).refine((data) => {
  if (data.riskLevel === 'Custom') {
    return data.customRiskPercentage !== undefined;
  }
  return true;
}, {
  message: "Custom risk percentage is required when Custom risk level is selected",
  path: ["customRiskPercentage"],
});

type FormData = z.infer<typeof formSchema>;

interface GrowthPlanFormProps {
  userId: string;
  onPlanCreated: (plan: any) => void;
}

const GrowthPlanForm: React.FC<GrowthPlanFormProps> = ({ userId, onPlanCreated }) => {
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
      riskLevel: 'Medium'
    }
  });

  const riskLevel = watch('riskLevel');
  const customRiskPercentage = watch('customRiskPercentage');
  const startingBalance = watch('startingBalance');
  const targetBalance = watch('targetBalance');

  const getRiskPercentage = (level: string, customPercentage?: number) => {
    switch (level) {
      case 'Low': return 2;
      case 'Medium': return 5;
      case 'High': return 10;
      case 'Custom': return customPercentage || 5;
      default: return 5;
    }
  };

  const calculatePlan = (starting: number, target: number, riskPercent: number) => {
    const totalGrowthNeeded = target - starting;
    const avgProfitPerTrade = starting * (riskPercent / 100);
    const estimatedTrades = Math.ceil(totalGrowthNeeded / avgProfitPerTrade);
    const riskPerTrade = starting * (riskPercent / 100);
    
    return {
      estimatedTrades,
      profitPerTrade: avgProfitPerTrade,
      riskPerTrade
    };
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const riskPercentage = getRiskPercentage(data.riskLevel, data.customRiskPercentage);
      const calculations = calculatePlan(data.startingBalance, data.targetBalance, riskPercentage);

      const planData = {
        user_id: userId,
        starting_balance: data.startingBalance,
        target_balance: data.targetBalance,
        current_balance: data.startingBalance,
        risk_level: data.riskLevel,
        risk_percentage: riskPercentage,
        estimated_trades: calculations.estimatedTrades,
        profit_per_trade: calculations.profitPerTrade,
        risk_per_trade: calculations.riskPerTrade,
        trades_completed: 0,
        is_active: true
      };

      const { data: newPlan, error } = await supabase
        .from('growth_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;

      onPlanCreated(newPlan);
    } catch (error) {
      console.error('Error creating growth plan:', error);
      toast({
        title: "Error",
        description: "Failed to create growth plan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRiskPercentage = getRiskPercentage(riskLevel, customRiskPercentage);
  const currentCalculations = startingBalance && targetBalance && riskLevel ? 
    calculatePlan(startingBalance, targetBalance, currentRiskPercentage) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startingBalance">Starting Balance ($)</Label>
          <Input
            id="startingBalance"
            type="number"
            step="0.01"
            placeholder="30.00"
            {...register('startingBalance', { valueAsNumber: true })}
          />
          {errors.startingBalance && (
            <p className="text-sm text-destructive">{errors.startingBalance.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetBalance">Target Balance ($)</Label>
          <Input
            id="targetBalance"
            type="number"
            step="0.01"
            placeholder="500.00"
            {...register('targetBalance', { valueAsNumber: true })}
          />
          {errors.targetBalance && (
            <p className="text-sm text-destructive">{errors.targetBalance.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="riskLevel">Risk Level</Label>
          <Select 
            value={riskLevel} 
            onValueChange={(value) => setValue('riskLevel', value as 'Low' | 'Medium' | 'High' | 'Custom')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low (2% risk per trade)</SelectItem>
              <SelectItem value="Medium">Medium (5% risk per trade)</SelectItem>
              <SelectItem value="High">High (10% risk per trade)</SelectItem>
              <SelectItem value="Custom">Custom (set your own %)</SelectItem>
            </SelectContent>
          </Select>
          {errors.riskLevel && (
            <p className="text-sm text-destructive">{errors.riskLevel.message}</p>
          )}
        </div>

        {riskLevel === 'Custom' && (
          <div className="space-y-2">
            <Label htmlFor="customRiskPercentage">Custom Risk Percentage (%)</Label>
            <Input
              id="customRiskPercentage"
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              placeholder="7.5"
              {...register('customRiskPercentage', { valueAsNumber: true })}
            />
            {errors.customRiskPercentage && (
              <p className="text-sm text-destructive">{errors.customRiskPercentage.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter a value between 0.1% and 50%
            </p>
          </div>
        )}
      </div>

      {currentCalculations && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h3 className="font-medium">Plan Preview</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Estimated Trades</p>
              <p className="font-medium">{currentCalculations.estimatedTrades}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profit Per Trade</p>
              <p className="font-medium">${currentCalculations.profitPerTrade.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Risk Per Trade ({currentRiskPercentage}%)</p>
              <p className="font-medium">${currentCalculations.riskPerTrade.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating Plan...' : 'Create Growth Plan'}
      </Button>
    </form>
  );
};

export default GrowthPlanForm;
