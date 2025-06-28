
-- Create affiliate_info table
CREATE TABLE public.affiliate_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_name TEXT NOT NULL,
  link TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  message_body TEXT NOT NULL,
  button_label TEXT NOT NULL DEFAULT 'Support via Broker',
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add has_supported field to users table
ALTER TABLE public.users ADD COLUMN has_supported BOOLEAN DEFAULT false;

-- Add Row Level Security (RLS) to affiliate_info table
ALTER TABLE public.affiliate_info ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to read active affiliate info (public data)
CREATE POLICY "Anyone can view active affiliate info" 
  ON public.affiliate_info 
  FOR SELECT 
  USING (active = true);

-- Create policy that allows authenticated users to update their support status
CREATE POLICY "Users can update their own support status" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert a sample affiliate record
INSERT INTO public.affiliate_info (broker_name, link, logo_url, message_body, button_label, active)
VALUES (
  'Sample Broker',
  'https://example.com/affiliate-link',
  'https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=BROKER+LOGO',
  'Support our platform by signing up with our recommended broker. Your support helps us continue providing this free trading journal!',
  'Support via Broker',
  true
);
