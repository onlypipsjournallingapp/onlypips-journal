
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';
import { useAffiliateInfo } from '@/hooks/useAffiliateInfo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AffiliatePopupProps {
  userId?: string;
}

const AffiliatePopup: React.FC<AffiliatePopupProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: affiliateInfo } = useAffiliateInfo();
  const { toast } = useToast();

  useEffect(() => {
    if (!affiliateInfo || !userId) return;

    const checkShouldShowPopup = async () => {
      // Check localStorage for suppression flags
      const dontShowAgain = localStorage.getItem('affiliate-popup-disabled');
      const lastShown = localStorage.getItem('affiliate-popup-last-shown');
      
      if (dontShowAgain === 'true') return;

      // Check if user has already supported
      const { data: userData } = await supabase
        .from('users')
        .select('has_supported')
        .eq('id', userId)
        .single();

      if (userData?.has_supported) return;

      // Check if popup was shown in the last 3 days
      if (lastShown) {
        const lastShownDate = new Date(lastShown);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        if (lastShownDate > threeDaysAgo) return;
      }

      // Show the popup
      setIsOpen(true);
      localStorage.setItem('affiliate-popup-last-shown', new Date().toISOString());
    };

    checkShouldShowPopup();
  }, [affiliateInfo, userId]);

  const handleSupportClick = async () => {
    if (!affiliateInfo || !userId) return;

    try {
      // Update user's has_supported status
      await supabase
        .from('users')
        .update({ has_supported: true })
        .eq('id', userId);

      // Set localStorage flag
      localStorage.setItem('affiliate-popup-disabled', 'true');
      
      // Open affiliate link
      window.open(affiliateInfo.link, '_blank');
      
      toast({
        title: "Thank you for your support!",
        description: "You're being redirected to our partner broker.",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating support status:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('affiliate-popup-disabled', 'true');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!affiliateInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Support Our Platform
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={affiliateInfo.logo_url} 
              alt={affiliateInfo.broker_name}
              className="h-12 object-contain"
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            {affiliateInfo.message_body}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleSupportClick}
              className="flex-1 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {affiliateInfo.button_label}
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 text-sm">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDontShowAgain}
              className="flex-1 text-xs"
            >
              Don't show this again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AffiliatePopup;
