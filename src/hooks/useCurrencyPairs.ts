
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCurrencyPairs = () => {
  const [pairs, setPairs] = useState<{ symbol: string; display_name: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const { data, error } = await supabase
          .from('currency_pairs')
          .select('symbol, display_name')
          .eq('active', true)
          .order('symbol');

        if (error) throw error;
        setPairs(data || []);
      } catch (error) {
        console.error('Error fetching currency pairs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch currency pairs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPairs();
  }, [toast]);

  return { pairs, isLoading };
};
