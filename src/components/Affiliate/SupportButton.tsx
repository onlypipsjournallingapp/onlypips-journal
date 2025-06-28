
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { useAffiliateInfo } from '@/hooks/useAffiliateInfo';

const SupportButton: React.FC = () => {
  const { data: affiliateInfo } = useAffiliateInfo();

  if (!affiliateInfo) return null;

  const handleSupportClick = () => {
    window.open(affiliateInfo.link, '_blank');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleSupportClick}
      className="flex items-center gap-2 text-xs"
    >
      <Heart className="h-3 w-3" />
      Support Us
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
};

export default SupportButton;
