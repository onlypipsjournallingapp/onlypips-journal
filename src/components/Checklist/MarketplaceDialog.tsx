
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Eye, Check, ExternalLink, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  approval_status: string | null;
}

interface PaymentSubmission {
  marketplace_checklist_id: string;
  status: string;
}

interface BankDetails {
  id: string;
  cardholder_name: string;
  bank_name: string;
  account_number: string;
  branch_code: string;
}

interface MarketplaceDialogProps {
  userId: string;
  onChecklistPurchased: () => void;
}

const MarketplaceDialog: React.FC<MarketplaceDialogProps> = ({ userId, onChecklistPurchased }) => {
  const [checklists, setChecklists] = useState<MarketplaceChecklist[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<MarketplaceChecklist | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketplaceData();
    fetchUserEmail();
  }, [userId]);

  const fetchUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  };

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
        .select("marketplace_checklist_id, approval_status")
        .eq("user_id", userId);

      if (purchasesError) throw purchasesError;

      // Fetch payment submissions to check pending status
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("payment_submissions")
        .select("marketplace_checklist_id, status")
        .eq("user_id", userId);

      if (submissionsError) throw submissionsError;

      // Fetch bank details
      const { data: bankData, error: bankError } = await supabase
        .from("bank_details")
        .select("*")
        .eq("is_active", true)
        .single();

      if (bankError && bankError.code !== 'PGRST116') throw bankError;

      // Parse JSON fields safely
      const parsedChecklists = (checklistsData || []).map(checklist => ({
        ...checklist,
        preview_items: Array.isArray(checklist.preview_items) 
          ? checklist.preview_items 
          : typeof checklist.preview_items === 'string' 
            ? JSON.parse(checklist.preview_items) 
            : [],
        full_items: Array.isArray(checklist.full_items) 
          ? checklist.full_items 
          : typeof checklist.full_items === 'string' 
            ? JSON.parse(checklist.full_items) 
            : []
      }));

      setChecklists(parsedChecklists);
      setPurchases(purchasesData || []);
      setPaymentSubmissions(submissionsData || []);
      setBankDetails(bankData);
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
    const purchase = purchases.find(p => p.marketplace_checklist_id === checklistId);
    return purchase && purchase.approval_status === 'approved';
  };

  const hasPendingPayment = (checklistId: string) => {
    // Check both payment submissions and purchases for pending status
    const submission = paymentSubmissions.find(s => s.marketplace_checklist_id === checklistId);
    const purchase = purchases.find(p => p.marketplace_checklist_id === checklistId);
    
    return (submission && submission.status === 'pending') || 
           (purchase && purchase.approval_status === 'pending');
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

  const handlePurchaseClick = (checklist: MarketplaceChecklist) => {
    setSelectedChecklist(checklist);
    setPaymentDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, or PDF file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setUploadFile(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!uploadFile || !selectedChecklist) return;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${userId}/${selectedChecklist.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Create payment submission record
      const { error: submissionError } = await supabase
        .from('payment_submissions')
        .insert({
          user_id: userId,
          user_email: userEmail,
          marketplace_checklist_id: selectedChecklist.id,
          proof_file_url: publicUrl,
          status: 'pending'
        });

      if (submissionError) throw submissionError;

      // Create user purchase record
      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: userId,
          marketplace_checklist_id: selectedChecklist.id,
          amount_paid: selectedChecklist.price,
          status: 'pending',
          approval_status: 'pending'
        });

      if (purchaseError) throw purchaseError;

      toast({
        title: "Proof of payment submitted!",
        description: "Your payment proof has been submitted for review. You'll be notified once approved.",
      });

      setPaymentDialogOpen(false);
      setUploadFile(null);
      fetchMarketplaceData(); // Refresh to show pending status
    } catch (error) {
      console.error("Error submitting proof:", error);
      toast({
        title: "Submission failed",
        description: "Failed to submit proof of payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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
                const pending = hasPendingPayment(checklist.id);
                
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
                            <Badge variant="default">R{checklist.price}</Badge>
                          )}
                          {purchased && (
                            <Badge variant="outline" className="gap-1">
                              <Check className="h-3 w-3" />
                              Owned
                            </Badge>
                          )}
                          {pending && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending Approval
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
                        ) : pending ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                          >
                            Awaiting Approval
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
                            onClick={() => handlePurchaseClick(checklist)}
                            className="gap-1"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Purchase for R{checklist.price}
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

      {/* Bank Transfer Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bank Transfer Payment - {selectedChecklist?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedChecklist && bankDetails && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Step 1: Transfer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Amount:</strong> R{selectedChecklist.price}
                  </div>
                  <div>
                    <strong>Cardholder Name:</strong> {bankDetails.cardholder_name}
                  </div>
                  <div>
                    <strong>Bank Name:</strong> {bankDetails.bank_name}
                  </div>
                  <div>
                    <strong>Account Number:</strong> {bankDetails.account_number}
                  </div>
                  <div>
                    <strong>Branch Code:</strong> {bankDetails.branch_code}
                  </div>
                  <div>
                    <strong>Reference:</strong> {userEmail}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Important Instructions:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Use your email address ({userEmail}) as the payment reference</li>
                  <li>• Transfer exactly R{selectedChecklist.price}</li>
                  <li>• Upload proof of payment below</li>
                  <li>• Allow 1-2 business days for approval</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Step 2: Submit Proof of Payment</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="proof-upload">Upload proof of payment (JPG, PNG, or PDF)</Label>
                  <Input
                    id="proof-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                  />
                  {uploadFile && (
                    <p className="text-sm text-green-600">
                      File selected: {uploadFile.name}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSubmitProof}
                  disabled={!uploadFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Proof of Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {selectedChecklist && !bankDetails && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Bank details are not available at the moment. Please try again later.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MarketplaceDialog;
