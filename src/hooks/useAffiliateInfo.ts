
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AffiliateInfo {
  id: string;
  broker_name: string;
  link: string;
  logo_url: string;
  message_body: string;
  button_label: string;
  active: boolean;
}

export const useAffiliateInfo = () => {
  return useQuery({
    queryKey: ['affiliate-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_info')
        .select('*')
        .eq('active', true)
        .single();
      
      if (error) {
        console.error('Error fetching affiliate info:', error);
        return null;
      }
      
      return data as AffiliateInfo;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
