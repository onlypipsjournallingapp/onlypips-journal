
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  console.log('PayPal payment cancelled');
  
  // Redirect back to checklist page with cancellation message
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `https://ewzsiiclccdhszlbqzex.supabase.co/checklist?cancelled=true`,
    },
  });
});
