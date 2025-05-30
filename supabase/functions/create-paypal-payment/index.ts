
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
    const { checklistId, title, price, userId } = await req.json();

    console.log('Creating PayPal payment for:', { checklistId, title, price, userId });

    // PayPal sandbox credentials
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com'; // Sandbox URL

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

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
    
    if (!authResponse.ok) {
      console.error('PayPal auth error:', authData);
      throw new Error('Failed to authenticate with PayPal');
    }

    // Create payment
    const paymentData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: checklistId,
        amount: {
          currency_code: 'USD',
          value: price.toFixed(2)
        },
        description: `Strategy Checklist: ${title}`,
        custom_id: `${userId}_${checklistId}` // Store user and checklist info
      }],
      application_context: {
        return_url: `https://ewzsiiclccdhszlbqzex.supabase.co/functions/v1/paypal-success`,
        cancel_url: `https://ewzsiiclccdhszlbqzex.supabase.co/functions/v1/paypal-cancel`,
        brand_name: 'Strategy Marketplace',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW'
      }
    };

    const paymentResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'PayPal-Request-Id': `${checklistId}-${Date.now()}`,
      },
      body: JSON.stringify(paymentData),
    });

    const payment = await paymentResponse.json();
    
    if (!paymentResponse.ok) {
      console.error('PayPal payment creation error:', payment);
      throw new Error('Failed to create PayPal payment');
    }

    console.log('PayPal payment created:', payment.id);

    // Find the approval URL
    const approvalUrl = payment.links.find((link: any) => link.rel === 'approve')?.href;

    return new Response(
      JSON.stringify({ 
        url: approvalUrl,
        paymentId: payment.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-paypal-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
