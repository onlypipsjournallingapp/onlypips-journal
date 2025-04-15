import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownCircle, ArrowUpCircle, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurrencyPairs } from "@/hooks/useCurrencyPairs";

interface TradeFormProps {
  onSubmit: (tradeData: any) => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit }) => {
  const [pair, setPair] = useState('');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [profitLoss, setProfitLoss] = useState('');
  const [isBreakEven, setIsBreakEven] = useState(false);
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [tradeType, setTradeType] = useState<'REAL' | 'DEMO'>('REAL');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { pairs, isLoading: pairsLoading } = useCurrencyPairs();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        pair,
        direction,
        entry_price: entryPrice ? parseFloat(entryPrice) : null,
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        profit_loss: isBreakEven ? 0 : parseFloat(profitLoss),
        notes,
        is_break_even: isBreakEven,
        screenshot,
        trade_type: tradeType
      };

      await onSubmit(formData);
      
      setPair('');
      setDirection('BUY');
      setEntryPrice('');
      setExitPrice('');
      setProfitLoss('');
      setIsBreakEven(false);
      setNotes('');
      setScreenshot(null);
      
      toast({
        title: "Trade Added",
        description: "Your trade has been successfully recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card animate-fade-in w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">
          Log New Trade
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pair">Currency Pair</Label>
            <Select value={pair} onValueChange={setPair} required disabled={pairsLoading}>
              <SelectTrigger id="pair">
                <SelectValue placeholder="Select currency pair" />
              </SelectTrigger>
              <SelectContent>
                {pairs.map((currencyPair) => (
                  <SelectItem 
                    key={currencyPair.symbol} 
                    value={currencyPair.symbol}
                  >
                    {currencyPair.display_name || currencyPair.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trade Type</Label>
            <RadioGroup 
              value={tradeType} 
              onValueChange={(value) => setTradeType(value as 'REAL' | 'DEMO')}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REAL" id="real" />
                <Label htmlFor="real">Real</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DEMO" id="demo" />
                <Label htmlFor="demo">Demo</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price (Optional)</Label>
              <Input
                id="entryPrice"
                placeholder="0.00"
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price (Optional)</Label>
              <Input
                id="exitPrice"
                placeholder="0.00"
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="isBreakEven" 
                checked={isBreakEven}
                onCheckedChange={(checked) => setIsBreakEven(checked as boolean)}
              />
              <Label htmlFor="isBreakEven" className="cursor-pointer">Did this trade hit break-even?</Label>
            </div>
            
            {!isBreakEven && (
              <div className="space-y-2">
                <Label htmlFor="profitLoss">Profit / Loss (in your currency)</Label>
                <Input
                  id="profitLoss"
                  placeholder="-10.50 or 25.75"
                  type="number"
                  step="any"
                  value={profitLoss}
                  onChange={(e) => setProfitLoss(e.target.value)}
                  required={!isBreakEven}
                />
                <p className="text-xs text-muted-foreground">Enter the exact amount made or lost on this trade.</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="What was your trading rationale? What did you learn?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot</Label>
            <div className="flex items-center justify-center border border-dashed rounded-md p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label htmlFor="screenshot" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {screenshot ? screenshot.name : "Upload chart screenshot"}
                </span>
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            Log Trade
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TradeForm;
