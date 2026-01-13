-- Create discount type enum
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value INTEGER NOT NULL,
  min_nights INTEGER DEFAULT 1,
  min_total INTEGER DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  room_types TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotions
CREATE POLICY "Admins can manage promotions"
ON public.promotions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (is_active = true AND valid_until >= CURRENT_DATE);

-- Add promotion fields to reservations table
ALTER TABLE public.reservations 
ADD COLUMN promotion_id UUID REFERENCES public.promotions(id),
ADD COLUMN promotion_code TEXT,
ADD COLUMN discount_amount INTEGER DEFAULT 0;

-- Create trigger to update updated_at on promotions
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_reservations_updated_at();