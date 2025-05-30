
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Eye, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceChecklist {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  screenshot_url: string | null;
  preview_items: any[];
  full_items: any[];
}

interface UserPurchase {
  marketplace_checklist_id: string;
}

interface MarketplaceDialogProps {
  userId: string;
  onChecklistPurchased: () => void;
}

const MarketplaceDialog: React.FC<MarketplaceDialogProps> = ({ userId, onChecklistPurchased }) => {
  const [checklists, setChecklists] = useState<MarketplaceChecklist[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<MarketplaceChecklist | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketplaceData();
  }, [userId]);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      // Fetch marketplace checklists
      const { data: checklistsData, error: checklistsError } = await supabase
        .from("marketplace_checklists")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (checklistsError) throw checklistsError;

      // Fetch user purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("user_purchases")
        .select("marketplace_checklist_id")
        .eq("user_id", userId);

      if (purchasesError) throw purchasesError;

      setChecklists(checklistsData || []);
      setPurchases(purchasesData || []);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      toast({
        title: "Error",
        description: "Failed to load marketplace. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isPurchased = (checklistId: string) => {
    return purchases.some(p => p.marketplace_checklist_id === checklistId);
  };

  const handleFreeChecklistAdd = async (checklist: MarketplaceChecklist) => {
    try {
      // Create a new strategy from the free checklist
      const { data: strategy, error: strategyError } = await supabase
        .from("strategies")
        .insert({
          name: checklist.title,
          user_id: userId
        })
        .select()
        .single();

      if (strategyError) throw strategyError;

      // Add checklist items
      const items = checklist.full_items.map((item: any, index: number) => ({
        strategy_id: strategy.id,
        content: item.content,
        position: index,
        is_checked: false
      }));

      const { error: itemsError } = await supabase
        .from("strategy_checklist_items")
        .insert(items);

      if (itemsError) throw itemsError;

      toast({
        title: "Success!",
        description: `${checklist.title} has been added to your strategies.`
      });

      onChecklistPurchased();
    } catch (error) {
      console.error("Error adding free checklist:", error);
      toast({
        title: "Error",
        description: "Failed to add checklist. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePayPalPayment = async (checklist: MarketplaceChecklist) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-payment', {
        body: {
          checklistId: checklist.id,
          title: checklist.title,
          price: checklist.price,
          userId: userId
        }
      });

      if (error) throw error;

      // Open PayPal payment in new tab
      window.open(data.url, '_blank');

      toast({
        title: "Payment Initiated",
        description: "You'll be redirected to PayPal to complete the payment."
      });
    } catch (error) {
      console.error("Error creating PayPal payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const showPreview = (checklist: MarketplaceChecklist) => {
    setSelectedChecklist(checklist);
    setPreviewOpen(true);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Marketplace
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Strategy Marketplace</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="text-center py-8">Loading marketplace...</div>
          ) : (
            <div className="grid gap-4">
              {checklists.map((checklist) => {
                const purchased = isPurchased(checklist.id);
                
                return (
                  <Card key={checklist.id} className="w-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{checklist.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">{checklist.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {checklist.is_free ? (
                            <Badge variant="secondary">Free</Badge>
                          ) : (
                            <Badge variant="default">${checklist.price}</Badge>
                          )}
                          {purchased && (
                            <Badge variant="outline" className="gap-1">
                              <Check className="h-3 w-3" />
                              Owned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => showPreview(checklist)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        
                        {purchased ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFreeChecklistAdd(checklist)}
                            className="gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Add to My Strategies
                          </Button>
                        ) : checklist.is_free ? (
                          <Button
                            size="sm"
                            onClick={() => handleFreeChecklistAdd(checklist)}
                          >
                            Add Free Strategy
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePayPalPayment(checklist)}
                            className="gap-1"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Buy for ${checklist.price}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedChecklist?.title} - Preview</DialogTitle>
          </DialogHeader>
          
          {selectedChecklist && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedChecklist.description}</p>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {selectedChecklist.is_free ? "Full Checklist:" : "Preview Items:"}
                </h4>
                <ul className="space-y-2">
                  {(selectedChecklist.is_free 
                    ? selectedChecklist.full_items 
                    : selectedChecklist.preview_items
                  ).map((item: any, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{item.content}</span>
                    </li>
                  ))}
                </ul>
                
                {!selectedChecklist.is_free && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Purchase to unlock the complete {selectedChecklist.full_items.length}-item checklist.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MarketplaceDialog;
