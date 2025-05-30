
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token'); // PayPal payment ID
    const payerId = url.searchParams.get('PayerID');

    console.log('PayPal success callback:', { token, payerId });

    if (!token) {
      throw new Error('Missing payment token');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // PayPal credentials
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com';

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();

    // Capture the payment
    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
    });

    const captureData = await captureResponse.json();
    console.log('PayPal capture response:', captureData);

    if (captureData.status === 'COMPLETED') {
      // Parse custom_id to get user and checklist info
      const customId = captureData.purchase_units[0].payments.captures[0].custom_id;
      const [userId, checklistId] = customId.split('_');
      const amountPaid = parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value);
      const transactionId = captureData.purchase_units[0].payments.captures[0].id;

      console.log('Processing purchase:', { userId, checklistId, amountPaid, transactionId });

      // Record the purchase
      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: userId,
          marketplace_checklist_id: checklistId,
          paypal_transaction_id: transactionId,
          amount_paid: amountPaid,
          status: 'completed'
        });

      if (purchaseError) {
        console.error('Error recording purchase:', purchaseError);
        throw purchaseError;
      }

      // Get the checklist data to create strategy
      const { data: checklist, error: checklistError } = await supabase
        .from('marketplace_checklists')
        .select('*')
        .eq('id', checklistId)
        .single();

      if (checklistError) {
        console.error('Error fetching checklist:', checklistError);
        throw checklistError;
      }

      // Create a new strategy from the purchased checklist
      const { data: strategy, error: strategyError } = await supabase
        .from('strategies')
        .insert({
          name: checklist.title,
          user_id: userId
        })
        .select()
        .single();

      if (strategyError) {
        console.error('Error creating strategy:', strategyError);
        throw strategyError;
      }

      // Add checklist items
      const items = checklist.full_items.map((item: any, index: number) => ({
        strategy_id: strategy.id,
        content: item.content,
        position: index,
        is_checked: false
      }));

      const { error: itemsError } = await supabase
        .from('strategy_checklist_items')
        .insert(items);

      if (itemsError) {
        console.error('Error creating checklist items:', itemsError);
        throw itemsError;
      }

      console.log('Purchase completed successfully');

      // Redirect to success page with the strategy
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `https://ewzsiiclccdhszlbqzex.supabase.co/checklist?purchased=${checklist.title}`,
        },
      });
    } else {
      throw new Error(`Payment capture failed: ${captureData.status}`);
    }

  } catch (error) {
    console.error('Error in paypal-success:', error);
    
    // Redirect to error page
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `https://ewzsiiclccdhszlbqzex.supabase.co/checklist?error=payment_failed`,
      },
    });
  }
});
