
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PaymentSubmission {
  id: string;
  user_id: string;
  user_email: string;
  marketplace_checklist_id: string;
  proof_file_url: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
  marketplace_checklists: {
    title: string;
    price: number;
  };
}

const PaymentApprovalPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [viewProofOpen, setViewProofOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_submissions")
        .select(`
          *,
          marketplace_checklists (
            title,
            price
          )
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load payment submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (submissionId: string, approved: boolean) => {
    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      // Update submission status
      const { error: updateError } = await supabase
        .from("payment_submissions")
        .update({
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", submissionId);

      if (updateError) throw updateError;

      if (approved) {
        // Update user purchase status
        const { error: purchaseError } = await supabase
          .from("user_purchases")
          .update({
            approval_status: 'approved'
          })
          .eq("user_id", submission.user_id)
          .eq("marketplace_checklist_id", submission.marketplace_checklist_id);

        if (purchaseError) throw purchaseError;

        // Get checklist data to create strategy
        const { data: checklist, error: checklistError } = await supabase
          .from('marketplace_checklists')
          .select('*')
          .eq('id', submission.marketplace_checklist_id)
          .single();

        if (checklistError) throw checklistError;

        // Create a new strategy from the purchased checklist
        const { data: strategy, error: strategyError } = await supabase
          .from("strategies")
          .insert({
            name: checklist.title,
            user_id: submission.user_id
          })
          .select()
          .single();

        if (strategyError) throw strategyError;

        // Parse and add checklist items
        const fullItems = Array.isArray(checklist.full_items) 
          ? checklist.full_items 
          : JSON.parse(checklist.full_items as string);

        const items = fullItems.map((item: any, index: number) => ({
          strategy_id: strategy.id,
          content: item.content,
          position: index,
          is_checked: false
        }));

        const { error: itemsError } = await supabase
          .from("strategy_checklist_items")
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({
        title: approved ? "Payment Approved" : "Payment Rejected",
        description: approved 
          ? "User has been granted access to the checklist."
          : "Payment has been rejected."
      });

      fetchSubmissions(); // Refresh the list
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: "Failed to update submission status.",
        variant: "destructive"
      });
    }
  };

  const viewProof = (submission: PaymentSubmission) => {
    setSelectedSubmission(submission);
    setViewProofOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Approval Dashboard</h1>
        <Button onClick={fetchSubmissions} variant="outline">Refresh</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading submissions...</div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {submission.marketplace_checklists.title}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {submission.user_email} • R{submission.marketplace_checklists.price}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(submission.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewProof(submission)}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Proof
                  </Button>
                  
                  {submission.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApproval(submission.id, true)}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproval(submission.id, false)}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Proof Viewing Dialog */}
      <Dialog open={viewProofOpen} onOpenChange={setViewProofOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Proof of Payment</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>User:</strong> {selectedSubmission.user_email}</div>
                <div><strong>Checklist:</strong> {selectedSubmission.marketplace_checklists.title}</div>
                <div><strong>Amount:</strong> R{selectedSubmission.marketplace_checklists.price}</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}</div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Proof of Payment File</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedSubmission.proof_file_url, '_blank')}
                    className="gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                </div>
                
                {selectedSubmission.proof_file_url.toLowerCase().includes('.pdf') ? (
                  <div className="bg-gray-100 p-8 text-center rounded">
                    <p>PDF file - click "Open in New Tab" to view</p>
                  </div>
                ) : (
                  <img
                    src={selectedSubmission.proof_file_url}
                    alt="Proof of payment"
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentApprovalPage;
