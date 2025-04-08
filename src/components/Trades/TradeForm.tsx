
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

interface TradeFormProps {
  onSubmit: (tradeData: any) => void;
}

const CURRENCY_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", 
  "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", 
  "EUR/JPY", "GBP/JPY", "BTC/USD", "ETH/USD"
];

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit }) => {
  const [pair, setPair] = useState('');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const calculateResult = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    
    if (isNaN(entry) || isNaN(exit)) return null;
    
    if (direction === 'BUY') {
      return exit > entry ? 'WIN' : exit < entry ? 'LOSS' : 'BREAK EVEN';
    } else {
      return exit < entry ? 'WIN' : exit > entry ? 'LOSS' : 'BREAK EVEN';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = calculateResult();
    if (!result) {
      toast({
        title: "Invalid Prices",
        description: "Please enter valid entry and exit prices",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const formData = {
        pair,
        direction,
        entry_price: parseFloat(entryPrice),
        exit_price: parseFloat(exitPrice),
        notes,
        result,
        screenshot,
      };

      await onSubmit(formData);
      
      // Reset form
      setPair('');
      setDirection('BUY');
      setEntryPrice('');
      setExitPrice('');
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
            <Select value={pair} onValueChange={setPair} required>
              <SelectTrigger id="pair">
                <SelectValue placeholder="Select currency pair" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_PAIRS.map((currencyPair) => (
                  <SelectItem key={currencyPair} value={currencyPair}>
                    {currencyPair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Direction</Label>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-2">
                <ArrowUpCircle 
                  className={`w-5 h-5 ${direction === 'BUY' ? 'text-profit' : 'text-muted-foreground'}`} 
                />
                <span>BUY</span>
              </div>
              <Switch
                checked={direction === 'SELL'}
                onCheckedChange={(checked) => setDirection(checked ? 'SELL' : 'BUY')}
              />
              <div className="flex items-center space-x-2">
                <span>SELL</span>
                <ArrowDownCircle 
                  className={`w-5 h-5 ${direction === 'SELL' ? 'text-loss' : 'text-muted-foreground'}`} 
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                placeholder="0.00"
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                placeholder="0.00"
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                required
              />
            </div>
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
